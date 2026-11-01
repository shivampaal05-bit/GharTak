import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getDb } from '../db/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { config } from '../config';

export const contactsRouter = Router();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

// GET /contacts
contactsRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const contacts = await db.query<any>(
    'SELECT id, name, phone_e164, status, created_at FROM trusted_contacts WHERE owner_id = ? AND status != "REMOVED" ORDER BY created_at ASC',
    [req.user!.id]
  );
  return res.json(contacts);
});

// POST /contacts
contactsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, phone_e164 } = req.body;
  const ownerId = req.user!.id;
  const ownerName = req.user!.name;

  if (!name || !phone_e164) {
    return res.status(400).json({ error: 'name and phone_e164 are required' });
  }

  if (!E164_REGEX.test(phone_e164)) {
    return res.status(400).json({ error: 'phone_e164 must be in E.164 format (e.g. +919876543210)' });
  }

  const db = getDb();

  // Limit check: Maximum 5 ACCEPTED contacts per owner
  const acceptedCountRow = await db.get<any>(
    'SELECT COUNT(*) as count FROM trusted_contacts WHERE owner_id = ? AND status = "ACCEPTED"',
    [ownerId]
  );
  if (acceptedCountRow && acceptedCountRow.count >= 5) {
    return res.status(400).json({ error: 'Maximum 5 accepted contacts allowed per owner' });
  }

  // Daily invite limit check: 10 invites per user per day
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const dailyInvites = await db.get<any>(
    `SELECT COUNT(*) as count FROM invites i 
     JOIN trusted_contacts tc ON i.contact_id = tc.id 
     WHERE tc.owner_id = ? AND tc.created_at >= ?`,
    [ownerId, oneDayAgo]
  );
  if (dailyInvites && dailyInvites.count >= 10) {
    return res.status(429).json({ error: 'Daily invite limit reached (maximum 10 invites per day)' });
  }

  const contactId = uuidv4();
  const now = new Date().toISOString();

  await db.run(
    'INSERT INTO trusted_contacts (id, owner_id, contact_user_id, name, phone_e164, status, created_at) VALUES (?, ?, ?, ?, ?, "PENDING", ?)',
    [contactId, ownerId, null, name.trim(), phone_e164.trim(), now]
  );

  // Generate invite token (expires in config.inviteTtlHours - default 6 hours)
  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashToken(rawToken);
  const inviteId = uuidv4();
  const expiresAt = new Date(Date.now() + config.inviteTtlHours * 60 * 60 * 1000).toISOString();

  await db.run(
    'INSERT INTO invites (id, contact_id, token_hash, expires_at, used_at) VALUES (?, ?, ?, ?, NULL)',
    [inviteId, contactId, tokenHash, expiresAt]
  );

  const inviteUrl = `${config.publicBaseUrl}/invite/${rawToken}`;
  const messageText = `${ownerName} has added you as a trusted contact on GharTak (${ownerName} ne aapko GharTak par trusted contact banaya hai). Accept here: ${inviteUrl}`;

  return res.status(201).json({
    contact: {
      id: contactId,
      name: name.trim(),
      phone_e164: phone_e164.trim(),
      status: 'PENDING',
    },
    invite_url: inviteUrl,
    message_text: messageText,
  });
});

// POST /invites/:token/accept
contactsRouter.post('/invites/:token/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { token } = req.params;
  const db = getDb();
  const tokenHash = hashToken(token);

  const invite = await db.get<any>(
    'SELECT * FROM invites WHERE token_hash = ?',
    [tokenHash]
  );

  if (!invite) {
    return res.status(404).json({ error: 'Invalid invite link' });
  }

  if (invite.used_at) {
    return res.status(400).json({ error: 'Invite token already used' });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invite has expired' });
  }

  const contact = await db.get<any>(
    'SELECT * FROM trusted_contacts WHERE id = ?',
    [invite.contact_id]
  );

  if (!contact) {
    return res.status(404).json({ error: 'Contact record not found' });
  }

  // Check if owner already has 5 ACCEPTED contacts
  const acceptedCount = await db.get<any>(
    'SELECT COUNT(*) as count FROM trusted_contacts WHERE owner_id = ? AND status = "ACCEPTED"',
    [contact.owner_id]
  );

  if (acceptedCount && acceptedCount.count >= 5) {
    return res.status(400).json({ error: 'Owner already reached maximum 5 accepted contacts' });
  }

  const now = new Date().toISOString();
  await db.run('UPDATE invites SET used_at = ? WHERE id = ?', [now, invite.id]);
  await db.run(
    'UPDATE trusted_contacts SET status = "ACCEPTED", contact_user_id = ? WHERE id = ?',
    [req.user!.id, contact.id]
  );

  return res.json({
    success: true,
    message: 'Invite accepted successfully',
    contact_id: contact.id,
  });
});

// DELETE /contacts/:id
contactsRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const contact = await db.get<any>(
    'SELECT * FROM trusted_contacts WHERE id = ? AND owner_id = ?',
    [id, req.user!.id]
  );

  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  await db.run('DELETE FROM trusted_contacts WHERE id = ?', [id]);
  return res.json({ success: true, message: 'Contact removed' });
});
