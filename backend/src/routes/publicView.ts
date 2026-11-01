import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/database';

export const publicViewRouter = Router();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// GET /v/:token (Public web live-view)
publicViewRouter.get('/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  const tokenHash = hashToken(token);
  const db = getDb();

  // Find share session
  const share = await db.get<any>(
    `SELECT ss.id, ss.user_id, ss.transport, ss.vehicle_number, ss.status, ss.started_at, ss.ended_at,
            u.name as user_name, u.phone_e164 as user_phone,
            sl.lat, sl.lng, sl.accuracy_m, sl.place_label, sl.captured_at, sl.updated_at
     FROM share_sessions ss
     JOIN users u ON ss.user_id = u.id
     LEFT JOIN share_locations sl ON sl.share_id = ss.id
     WHERE ss.view_token_hash = ?`,
    [tokenHash]
  );

  if (!share) {
    return res.status(404).json({
      error: 'This journey has ended or the link is invalid.',
      code: 'LINK_EXPIRED_OR_INVALID',
    });
  }

  if (share.status === 'ENDED') {
    return res.status(410).json({
      error: 'This journey has ended.',
      code: 'JOURNEY_ENDED',
    });
  }

  // Check if there is an active SOS for this user
  const activeSos = await db.get<any>(
    `SELECT id, pressed_at, transport, vehicle_number, last_lat, last_lng, place_label, status
     FROM sos_events
     WHERE user_id = ? AND status = "ACTIVE"
     ORDER BY pressed_at DESC LIMIT 1`,
    [share.user_id]
  );

  return res.json({
    share_id: share.id,
    user_name: share.user_name,
    user_phone: share.user_phone,
    transport: share.transport,
    vehicle_number: share.vehicle_number,
    status: share.status,
    started_at: share.started_at,
    location: share.lat !== null ? {
      lat: share.lat,
      lng: share.lng,
      accuracy_m: share.accuracy_m,
      place_label: share.place_label,
      captured_at: share.captured_at,
      updated_at: share.updated_at,
    } : null,
    active_sos: activeSos || null,
  });
});
