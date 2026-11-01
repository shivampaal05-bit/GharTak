import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getDb } from '../db/database';
import { config } from '../config';

export const authRouter = Router();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /auth/google
authRouter.post('/google', async (req: Request, res: Response) => {
  const { id_token, mock_email, mock_name, mock_sub } = req.body;
  if (!id_token) {
    return res.status(400).json({ error: 'id_token is required' });
  }

  const db = getDb();

  // In test / simulation environment or mock tokens:
  let sub = mock_sub || `google_sub_${hashToken(id_token).slice(0, 16)}`;
  let email = mock_email || `user_${sub.slice(-6)}@example.com`;
  let name = mock_name || 'GharTak User';

  // Find or create user
  let user = await db.get<any>('SELECT * FROM users WHERE google_sub = ? AND deleted_at IS NULL', [sub]);

  if (!user) {
    const userId = uuidv4();
    const createdAt = new Date().toISOString();
    await db.run(
      'INSERT INTO users (id, google_sub, email, name, phone_e164, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, sub, email, name, null, createdAt]
    );
    user = { id: userId, google_sub: sub, email, name, phone_e164: null, created_at: createdAt };
  }

  // Issue 15-minute access token
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  // Generate rotating refresh token
  const rawRefreshToken = uuidv4();
  const refreshTokenHash = hashToken(rawRefreshToken);
  const refreshExpiresAt = new Date(Date.now() + config.refreshExpiresInDays * 24 * 60 * 60 * 1000).toISOString();

  await db.run(
    'INSERT INTO refresh_tokens (token_hash, user_id, expires_at, revoked) VALUES (?, ?, ?, 0)',
    [refreshTokenHash, user.id, refreshExpiresAt]
  );

  return res.json({
    access_token: accessToken,
    refresh_token: rawRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_e164: user.phone_e164,
    },
  });
});

// POST /auth/refresh
authRouter.post('/refresh', async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  const db = getDb();
  const tokenHash = hashToken(refresh_token);

  const storedToken = await db.get<any>(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0',
    [tokenHash]
  );

  if (!storedToken) {
    return res.status(401).json({ error: 'Invalid or revoked refresh token' });
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Refresh token expired' });
  }

  const user = await db.get<any>('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [storedToken.user_id]);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  // Revoke old refresh token (rotate)
  await db.run('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?', [tokenHash]);

  // Issue new tokens
  const newAccessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  const newRawRefreshToken = uuidv4();
  const newRefreshTokenHash = hashToken(newRawRefreshToken);
  const refreshExpiresAt = new Date(Date.now() + config.refreshExpiresInDays * 24 * 60 * 60 * 1000).toISOString();

  await db.run(
    'INSERT INTO refresh_tokens (token_hash, user_id, expires_at, revoked) VALUES (?, ?, ?, 0)',
    [newRefreshTokenHash, user.id, refreshExpiresAt]
  );

  return res.json({
    access_token: newAccessToken,
    refresh_token: newRawRefreshToken,
  });
});

// POST /auth/logout
authRouter.post('/logout', async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (refresh_token) {
    const db = getDb();
    const tokenHash = hashToken(refresh_token);
    await db.run('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?', [tokenHash]);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});
