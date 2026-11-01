import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { wsManager } from '../services/websocket';

export const sosRouter = Router();

// POST /sos (Idempotent by sos_id)
sosRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const {
    sos_id,
    pressed_at,
    transport,
    vehicle_number,
    location,
    place_label,
    trail,
    delivery_channel,
  } = req.body;

  const userId = req.user!.id;
  const userName = req.user!.name;

  if (!sos_id) {
    return res.status(400).json({ error: 'sos_id (UUID v4) is required' });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const lat = location?.lat || 0;
  const lng = location?.lng || 0;
  const pressed = pressed_at || now;
  const channel = delivery_channel || 'INTERNET';

  // Check if SOS already exists (idempotency check)
  const existingSos = await db.get<any>('SELECT * FROM sos_events WHERE id = ?', [sos_id]);

  if (existingSos) {
    // Existing SOS: update current location and trail, preserve original pressed_at
    await db.run(
      `UPDATE sos_events 
       SET last_lat = ?, last_lng = ?, place_label = COALESCE(?, place_label)
       WHERE id = ?`,
      [lat, lng, place_label || null, sos_id]
    );

    // Append any new trail points
    if (trail && Array.isArray(trail)) {
      for (const pt of trail) {
        await db.run(
          'INSERT INTO sos_trail (sos_id, lat, lng, captured_at) VALUES (?, ?, ?, ?)',
          [sos_id, pt.lat, pt.lng, pt.t || now]
        );
      }
    }

    const recipients = await db.query<any>(
      `SELECT sr.contact_id, sr.notified_at, sr.ack_at, tc.name, tc.phone_e164
       FROM sos_recipients sr
       JOIN trusted_contacts tc ON sr.contact_id = tc.id
       WHERE sr.sos_id = ?`,
      [sos_id]
    );

    // Broadcast update without creating duplicate initial alerts
    wsManager.broadcast(`sos:${sos_id}`, 'sos_update', {
      sos_id,
      lat,
      lng,
      place_label: place_label || existingSos.place_label,
      updated_at: now,
    });

    return res.json({
      sos_id,
      status: existingSos.status,
      delivery_state: 'SENT_INTERNET',
      is_update: true,
      recipients,
    });
  }

  // Create new SOS record
  await db.run(
    `INSERT INTO sos_events (id, user_id, share_id, pressed_at, received_at, transport, vehicle_number, status, delivery_channel, last_lat, last_lng, place_label, resolved_at)
     VALUES (?, ?, NULL, ?, ?, ?, ?, "ACTIVE", ?, ?, ?, ?, NULL)`,
    [sos_id, userId, pressed, now, (transport || 'BUS').toUpperCase(), vehicle_number || null, channel, lat, lng, place_label || null]
  );

  // Store trail points
  if (trail && Array.isArray(trail)) {
    for (const pt of trail) {
      await db.run(
        'INSERT INTO sos_trail (sos_id, lat, lng, captured_at) VALUES (?, ?, ?, ?)',
        [sos_id, pt.lat, pt.lng, pt.t || now]
      );
    }
  }

  // Find all ACCEPTED trusted contacts
  const acceptedContacts = await db.query<any>(
    'SELECT id, name, phone_e164 FROM trusted_contacts WHERE owner_id = ? AND status = "ACCEPTED"',
    [userId]
  );

  const recipientRecords = [];
  for (const contact of acceptedContacts) {
    await db.run(
      'INSERT INTO sos_recipients (sos_id, contact_id, notified_at, ack_at, renotify_count) VALUES (?, ?, ?, NULL, 0)',
      [sos_id, contact.id, now]
    );
    recipientRecords.push({
      contact_id: contact.id,
      name: contact.name,
      phone_e164: contact.phone_e164,
      notified_at: now,
      ack_at: null,
    });
  }

  const sosAlertPayload = {
    sos_id,
    user_id: userId,
    user_name: userName,
    transport: (transport || 'BUS').toUpperCase(),
    vehicle_number: vehicle_number || null,
    place_label: place_label || null,
    lat,
    lng,
    pressed_at: pressed,
    recipients: recipientRecords,
  };

  // Broadcast to global/receiver WebSocket channels
  wsManager.broadcast(`sos:${sos_id}`, 'sos_alert', sosAlertPayload);

  return res.status(201).json({
    sos_id,
    status: 'ACTIVE',
    delivery_state: 'SENT_INTERNET',
    pressed_at: pressed,
    recipients: recipientRecords,
  });
});

// PUT /sos/:id/location (Live updates during an SOS every 5s)
sosRouter.put('/:id/location', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { lat, lng, place_label, captured_at } = req.body;
  const userId = req.user!.id;
  const db = getDb();

  const sos = await db.get<any>(
    'SELECT * FROM sos_events WHERE id = ? AND user_id = ? AND status = "ACTIVE"',
    [id, userId]
  );

  if (!sos) {
    return res.status(404).json({ error: 'Active SOS event not found' });
  }

  const now = new Date().toISOString();
  await db.run(
    'UPDATE sos_events SET last_lat = ?, last_lng = ?, place_label = COALESCE(?, place_label) WHERE id = ?',
    [lat, lng, place_label || null, id]
  );

  await db.run(
    'INSERT INTO sos_trail (sos_id, lat, lng, captured_at) VALUES (?, ?, ?, ?)',
    [id, lat, lng, captured_at || now]
  );

  const payload = {
    sos_id: id,
    lat,
    lng,
    place_label: place_label || sos.place_label,
    updated_at: now,
  };

  wsManager.broadcast(`sos:${id}`, 'location', payload);
  return res.json(payload);
});

// POST /sos/:id/ack (Contact tapped "Dekh liya")
sosRouter.post('/:id/ack', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const callerId = req.user!.id;
  const db = getDb();

  const sos = await db.get<any>('SELECT * FROM sos_events WHERE id = ?', [id]);
  if (!sos) {
    return res.status(404).json({ error: 'SOS event not found' });
  }

  // Find the contact record for this caller
  const contact = await db.get<any>(
    'SELECT id FROM trusted_contacts WHERE owner_id = ? AND contact_user_id = ?',
    [sos.user_id, callerId]
  );

  const contactId = contact ? contact.id : callerId;
  const now = new Date().toISOString();

  await db.run(
    'UPDATE sos_recipients SET ack_at = ? WHERE sos_id = ? AND contact_id = ?',
    [now, id, contactId]
  );

  wsManager.broadcast(`sos:${id}`, 'ack', {
    sos_id: id,
    contact_id: contactId,
    ack_at: now,
  });

  return res.json({ success: true, message: 'Dekh liya recorded' });
});

// POST /sos/:id/resolve (User tapped "Main safe hoon")
sosRouter.post('/:id/resolve', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const db = getDb();

  const sos = await db.get<any>('SELECT * FROM sos_events WHERE id = ? AND user_id = ?', [id, userId]);
  if (!sos) {
    return res.status(404).json({ error: 'SOS event not found or unauthorized' });
  }

  const now = new Date().toISOString();
  await db.run('UPDATE sos_events SET status = "RESOLVED", resolved_at = ? WHERE id = ?', [now, id]);

  wsManager.broadcast(`sos:${id}`, 'resolved', {
    sos_id: id,
    status: 'RESOLVED',
    resolved_at: now,
  });

  return res.json({ success: true, message: 'Main safe hoon recorded. SOS resolved.' });
});

// GET /sos/:id (State for sender and contacts)
sosRouter.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const sos = await db.get<any>(
    `SELECT se.*, u.name as user_name, u.phone_e164 as user_phone
     FROM sos_events se
     JOIN users u ON se.user_id = u.id
     WHERE se.id = ?`,
    [id]
  );

  if (!sos) {
    return res.status(404).json({ error: 'SOS event not found' });
  }

  const recipients = await db.query<any>(
    `SELECT sr.contact_id, sr.notified_at, sr.ack_at, sr.renotify_count, tc.name, tc.phone_e164
     FROM sos_recipients sr
     JOIN trusted_contacts tc ON sr.contact_id = tc.id
     WHERE sr.sos_id = ?`,
    [id]
  );

  const trail = await db.query<any>(
    'SELECT lat, lng, captured_at FROM sos_trail WHERE sos_id = ? ORDER BY captured_at ASC',
    [id]
  );

  return res.json({
    ...sos,
    recipients,
    trail,
  });
});
