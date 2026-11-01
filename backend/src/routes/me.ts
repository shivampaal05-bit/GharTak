import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const meRouter = Router();

// E.164 phone number validator: e.g. +919876543210
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

// GET /me
meRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = await db.get<any>(
    'SELECT id, google_sub, email, name, phone_e164, created_at FROM users WHERE id = ? AND deleted_at IS NULL',
    [req.user!.id]
  );
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

// PATCH /me
meRouter.patch('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, phone_e164 } = req.body;
  const db = getDb();

  const user = await db.get<any>('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [req.user!.id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (phone_e164 !== undefined) {
    if (phone_e164 && !E164_REGEX.test(phone_e164)) {
      return res.status(400).json({ error: 'Phone number must be in E.164 format (e.g. +919876543210)' });
    }
  }

  const updatedName = name !== undefined ? name.trim() : user.name;
  const updatedPhone = phone_e164 !== undefined ? phone_e164.trim() : user.phone_e164;

  await db.run(
    'UPDATE users SET name = ?, phone_e164 = ? WHERE id = ?',
    [updatedName, updatedPhone, req.user!.id]
  );

  return res.json({
    id: user.id,
    email: user.email,
    name: updatedName,
    phone_e164: updatedPhone,
  });
});

// DELETE /me (Mera data delete karo)
meRouter.delete('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user!.id;
  const deletedAt = new Date().toISOString();

  // Mark user deleted
  await db.run('UPDATE users SET deleted_at = ? WHERE id = ?', [deletedAt, userId]);

  // Remove devices
  await db.run('DELETE FROM devices WHERE user_id = ?', [userId]);

  // Remove trusted contacts where owner is this user
  await db.run('DELETE FROM trusted_contacts WHERE owner_id = ?', [userId]);

  // Stop & clear active share sessions and current locations
  const shares = await db.query<any>('SELECT id FROM share_sessions WHERE user_id = ?', [userId]);
  for (const s of shares) {
    await db.run('DELETE FROM share_locations WHERE share_id = ?', [s.id]);
  }
  await db.run('DELETE FROM share_sessions WHERE user_id = ?', [userId]);

  // Delete active SOS trails and events
  const sosEvents = await db.query<any>('SELECT id FROM sos_events WHERE user_id = ?', [userId]);
  for (const ev of sosEvents) {
    await db.run('DELETE FROM sos_trail WHERE sos_id = ?', [ev.id]);
    await db.run('DELETE FROM sos_recipients WHERE sos_id = ?', [ev.id]);
  }
  await db.run('DELETE FROM sos_events WHERE user_id = ?', [userId]);

  // Invalidate refresh tokens
  await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);

  return res.json({ success: true, message: 'All user data has been deleted.' });
});

// POST /me/devices
meRouter.post('/devices', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { fcm_token, platform } = req.body;
  if (!fcm_token) {
    return res.status(400).json({ error: 'fcm_token is required' });
  }

  const db = getDb();
  const userId = req.user!.id;
  const now = new Date().toISOString();
  const devicePlatform = platform || 'android';

  const existing = await db.get<any>(
    'SELECT id FROM devices WHERE user_id = ? AND fcm_token = ?',
    [userId, fcm_token]
  );

  if (existing) {
    await db.run(
      'UPDATE devices SET platform = ?, updated_at = ? WHERE id = ?',
      [devicePlatform, now, existing.id]
    );
    return res.json({ id: existing.id, updated: true });
  } else {
    const id = uuidv4();
    await db.run(
      'INSERT INTO devices (id, user_id, fcm_token, platform, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, userId, fcm_token, devicePlatform, now]
    );
    return res.json({ id, created: true });
  }
});
