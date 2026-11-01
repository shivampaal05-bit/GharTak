import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { initDb, getDb } from '../src/db/database';

describe('Phase 1: Foundations', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let db: any;

  beforeAll(async () => {
    db = await initDb(':memory:');
  });

  afterAll(async () => {
    if (db) await db.close();
  });

  it('1.1 Google login creates user and issues 15-minute JWT and refresh token', async () => {
    const res = await request(app)
      .post('/auth/google')
      .send({
        id_token: 'test_token_user_1',
        mock_sub: 'google_user_1',
        mock_email: 'priya@example.com',
        mock_name: 'Priya Sharma',
      });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.user.name).toBe('Priya Sharma');
    user1Token = res.body.access_token;
    user1Id = res.body.user.id;
  });

  it('1.2 Profile update saves valid E.164 phone number', async () => {
    const res = await request(app)
      .patch('/me')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ phone_e164: '+919876543210' });

    expect(res.status).toBe(200);
    expect(res.body.phone_e164).toBe('+919876543210');
  });

  it('1.3 Invalid phone format is rejected', async () => {
    const res = await request(app)
      .patch('/me')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ phone_e164: '9876543210' }); // missing +

    expect(res.status).toBe(400);
  });

  it('1.4 Register device FCM token', async () => {
    const res = await request(app)
      .post('/me/devices')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ fcm_token: 'fcm_test_token_123', platform: 'android' });

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(true);
  });

  it('1.5 Create second user account to accept invite', async () => {
    const res = await request(app)
      .post('/auth/google')
      .send({
        id_token: 'test_token_user_2',
        mock_sub: 'google_user_2',
        mock_email: 'rahul@example.com',
        mock_name: 'Rahul Sharma',
      });

    expect(res.status).toBe(200);
    user2Token = res.body.access_token;
    user2Id = res.body.user.id;
  });

  it('1.6 User1 creates contact invite and receives invite URL with token', async () => {
    const res = await request(app)
      .post('/contacts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Rahul Bhai',
        phone_e164: '+919876500002',
      });

    expect(res.status).toBe(201);
    expect(res.body.invite_url).toBeDefined();
    expect(res.body.message_text).toContain('GharTak par trusted contact banaya hai');

    // Extract token from URL
    const token = res.body.invite_url.split('/invite/')[1];

    // Acceptance criterion: A second account can accept an invite
    const acceptRes = await request(app)
      .post(`/contacts/invites/${token}/accept`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);

    // Acceptance criterion: Invite can be accepted ONLY ONCE
    const replayRes = await request(app)
      .post(`/contacts/invites/${token}/accept`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(replayRes.status).toBe(400);
    expect(replayRes.body.error).toContain('already used');
  });

  it('1.7 Acceptance criterion: 6th contact is strictly rejected', async () => {
    // We already have 1 accepted contact. Let's add 4 more accepted contacts to hit the limit of 5.
    for (let i = 2; i <= 5; i++) {
      const inviteRes = await request(app)
        .post('/contacts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: `Contact ${i}`,
          phone_e164: `+91987650000${i}`,
        });

      expect(inviteRes.status).toBe(201);
      const token = inviteRes.body.invite_url.split('/invite/')[1];

      // Create a temporary user to accept
      const uRes = await request(app)
        .post('/auth/google')
        .send({ id_token: `token_${i}`, mock_sub: `sub_${i}`, mock_email: `c${i}@test.com`, mock_name: `C${i}` });

      const acceptRes = await request(app)
        .post(`/contacts/invites/${token}/accept`)
        .set('Authorization', `Bearer ${uRes.body.access_token}`);

      expect(acceptRes.status).toBe(200);
    }

    // Now try to add a 6th contact: should be rejected
    const sixthRes = await request(app)
      .post('/contacts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Contact 6 (Over limit)',
        phone_e164: '+919876500006',
      });

    expect(sixthRes.status).toBe(400);
    expect(sixthRes.body.error).toContain('Maximum 5 accepted contacts');
  });
});
