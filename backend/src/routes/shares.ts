import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getDb } from '../db/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { config } from '../config';
import { wsManager } from '../services/websocket';

export const sharesRouter = Router();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const VALID_TRANSPORTS = ['BUS', 'CAR', 'TRAIN', 'AUTO', 'WALK', 'PAIDAL', 'OTHER'];

// POST /shares (Start a share)
sharesRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { transport, vehicle_number } = req.body;
  const userId = req.user!.id;

  if (!transport || typeof transport !== 'string' || transport.trim().length === 0) {
    return res.status(400).json({ error: 'Valid transport is required' });
  }

  const normalizedTransport = transport.toUpperCase();
  const db = getDb();

  const shareId = uuidv4();
  const rawViewToken = crypto.randomBytes(24).toString('hex');
  const viewTokenHash = hashToken(rawViewToken);
  const now = new Date().toISOString();

  // Create share session
  await db.run(
    'INSERT INTO share_sessions (id, user_id, transport, vehicle_number, status, started_at, ended_at, view_token_hash) VALUES (?, ?, ?, ?, "ACTIVE", ?, NULL, ?)',
    [shareId, userId, normalizedTransport, vehicle_number ? vehicle_number.trim() : null, now, viewTokenHash]
  );

  // Minimal audit record without coordinates
  await db.run(
    'INSERT INTO share_audit (share_id, user_id, transport, started_at, ended_at) VALUES (?, ?, ?, ?, NULL)',
    [shareId, userId, normalizedTransport, now]
  );

  const viewUrl = `${config.publicBaseUrl}/v/${rawViewToken}`;

  // Notify WebSocket channel
  wsManager.broadcast(`share:${shareId}`, 'status', {
    status: 'ACTIVE',
    transport: normalizedTransport,
    vehicle_number,
    started_at: now,
  });

  return res.status(201).json({
    share_id: shareId,
    view_url: viewUrl,
    view_token: rawViewToken,
    transport: normalizedTransport,
    vehicle_number,
    status: 'ACTIVE',
  });
});

// PUT /shares/:id/location (Latest point upsert only)
sharesRouter.put('/:id/location', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { lat, lng, accuracy_m, captured_at, place_label } = req.body;
  const userId = req.user!.id;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  const db = getDb();
  const share = await db.get<any>(
    'SELECT * FROM share_sessions WHERE id = ? AND user_id = ? AND status = "ACTIVE"',
    [id, userId]
  );

  if (!share) {
    return res.status(404).json({ error: 'Active share session not found' });
  }

  const now = new Date().toISOString();
  const captured = captured_at || now;
  const accuracy = accuracy_m || 10;

  // Upsert into share_locations (only 1 row per share, current point only)
  await db.run(
    `INSERT INTO share_locations (share_id, lat, lng, accuracy_m, place_label, captured_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(share_id) DO UPDATE SET
       lat = excluded.lat,
       lng = excluded.lng,
       accuracy_m = excluded.accuracy_m,
       place_label = excluded.place_label,
       captured_at = excluded.captured_at,
       updated_at = excluded.updated_at`,
    [id, lat, lng, accuracy, place_label || null, captured, now]
  );

  const locationPayload = {
    share_id: id,
    lat,
    lng,
    accuracy_m: accuracy,
    place_label: place_label || null,
    captured_at: captured,
    updated_at: now,
  };

  // Broadcast to realtime WebSocket channel
  wsManager.broadcast(`share:${id}`, 'location', locationPayload);

  return res.json(locationPayload);
});

// PATCH /shares/:id (Update transport or vehicle_number)
sharesRouter.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { transport, vehicle_number } = req.body;
  const userId = req.user!.id;

  const db = getDb();
  const share = await db.get<any>(
    'SELECT * FROM share_sessions WHERE id = ? AND user_id = ? AND status = "ACTIVE"',
    [id, userId]
  );

  if (!share) {
    return res.status(404).json({ error: 'Active share session not found' });
  }

  const updatedTransport = transport ? transport.toUpperCase() : share.transport;
  const updatedVehicle = vehicle_number !== undefined ? vehicle_number : share.vehicle_number;

  await db.run(
    'UPDATE share_sessions SET transport = ?, vehicle_number = ? WHERE id = ?',
    [updatedTransport, updatedVehicle, id]
  );

  wsManager.broadcast(`share:${id}`, 'status', {
    status: 'ACTIVE',
    transport: updatedTransport,
    vehicle_number: updatedVehicle,
  });

  return res.json({
    id,
    transport: updatedTransport,
    vehicle_number: updatedVehicle,
  });
});

// POST /shares/:id/stop (Stop share and delete location row)
sharesRouter.post('/:id/stop', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const db = getDb();

  const share = await db.get<any>(
    'SELECT * FROM share_sessions WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (!share) {
    return res.status(404).json({ error: 'Share session not found' });
  }

  const now = new Date().toISOString();

  // Mark session ended
  await db.run('UPDATE share_sessions SET status = "ENDED", ended_at = ? WHERE id = ?', [now, id]);
  await db.run('UPDATE share_audit SET ended_at = ? WHERE share_id = ?', [now, id]);

  // CRITICAL PRIVACY MANDATE: delete its share_locations row immediately and invalidate view token
  await db.run('DELETE FROM share_locations WHERE share_id = ?', [id]);
  await db.run('UPDATE share_sessions SET view_token_hash = ? WHERE id = ?', [`REVOKED_${id}_${Date.now()}`, id]);

  // Broadcast ended event to subscribers
  wsManager.broadcast(`share:${id}`, 'ended', {
    status: 'ENDED',
    ended_at: now,
    message: 'Journey khatam',
  });

  return res.json({ success: true, message: 'Share ended and location row deleted.' });
});

// GET /shares/active (Shares the caller, as an accepted contact, is authorized to see)
sharesRouter.get('/active', authMiddleware, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const callerId = req.user!.id;

  // Find users who have accepted the caller as a trusted contact
  const shares = await db.query<any>(
    `SELECT ss.id, ss.user_id, u.name as user_name, u.phone_e164 as user_phone,
            ss.transport, ss.vehicle_number, ss.started_at,
            sl.lat, sl.lng, sl.accuracy_m, sl.place_label, sl.captured_at, sl.updated_at
     FROM share_sessions ss
     JOIN users u ON ss.user_id = u.id
     JOIN trusted_contacts tc ON tc.owner_id = ss.user_id
     LEFT JOIN share_locations sl ON sl.share_id = ss.id
     WHERE tc.contact_user_id = ? AND tc.status = "ACCEPTED" AND ss.status = "ACTIVE"`,
    [callerId]
  );

  return res.json(shares);
});

// GET /shares/:id (View current state of a share)
sharesRouter.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const callerId = req.user!.id;
  const db = getDb();

  const share = await db.get<any>(
    `SELECT ss.*, u.name as user_name, u.phone_e164 as user_phone,
            sl.lat, sl.lng, sl.accuracy_m, sl.place_label, sl.captured_at, sl.updated_at
     FROM share_sessions ss
     JOIN users u ON ss.user_id = u.id
     LEFT JOIN share_locations sl ON sl.share_id = ss.id
     WHERE ss.id = ?`,
    [id]
  );

  if (!share) {
    return res.status(404).json({ error: 'Share session not found' });
  }

  // Authorization check: either owner or an accepted trusted contact
  if (share.user_id !== callerId) {
    const isContact = await db.get<any>(
      'SELECT id FROM trusted_contacts WHERE owner_id = ? AND contact_user_id = ? AND status = "ACCEPTED"',
      [share.user_id, callerId]
    );
    if (!isContact) {
      return res.status(403).json({ error: 'Not authorized to view this share session' });
    }
  }

  return res.json(share);
});
