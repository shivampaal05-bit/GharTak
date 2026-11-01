import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { initDb, getDb } from '../src/db/database';

describe('Phase 2: Live Share', () => {
  let userToken: string;
  let contactToken: string;
  let shareId: string;
  let viewToken: string;
  let db: any;

  beforeAll(async () => {
    db = await initDb(':memory:');

    // Create user 1
    const u1 = await request(app)
      .post('/auth/google')
      .send({ id_token: 'u1', mock_sub: 's1', mock_email: 'u1@test.com', mock_name: 'Priya' });
    userToken = u1.body.access_token;

    // Create user 2 (contact)
    const u2 = await request(app)
      .post('/auth/google')
      .send({ id_token: 'u2', mock_sub: 's2', mock_email: 'u2@test.com', mock_name: 'Papa' });
    contactToken = u2.body.access_token;

    // Add and accept contact
    const inv = await request(app)
      .post('/contacts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Papa', phone_e164: '+919876511111' });
    const token = inv.body.invite_url.split('/invite/')[1];

    await request(app)
      .post(`/contacts/invites/${token}/accept`)
      .set('Authorization', `Bearer ${contactToken}`);
  });

  afterAll(async () => {
    if (db) await db.close();
  });

  it('2.1 Start live share creates session and view URL', async () => {
    const res = await request(app)
      .post('/shares')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        transport: 'BUS',
        vehicle_number: 'UP32AB1234',
      });

    expect(res.status).toBe(201);
    expect(res.body.share_id).toBeDefined();
    expect(res.body.view_url).toBeDefined();
    expect(res.body.view_token).toBeDefined();
    expect(res.body.status).toBe('ACTIVE');

    shareId = res.body.share_id;
    viewToken = res.body.view_token;
  });

  it('2.2 Location upsert stores only latest point', async () => {
    // Send 1st point
    await request(app)
      .put(`/shares/${shareId}/location`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ lat: 26.8467, lng: 80.9462, accuracy_m: 15, place_label: 'City Hospital ke paas' });

    // Send 2nd point (updated location)
    const res2 = await request(app)
      .put(`/shares/${shareId}/location`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ lat: 26.8500, lng: 80.9500, accuracy_m: 10, place_label: 'Hazratganj ke paas' });

    expect(res2.status).toBe(200);

    // Verify in database: only exactly 1 row exists for this share in share_locations
    const rows = await db.query('SELECT * FROM share_locations WHERE share_id = ?', [shareId]);
    expect(rows.length).toBe(1);
    expect(rows[0].lat).toBe(26.8500);
    expect(rows[0].place_label).toBe('Hazratganj ke paas');
  });

  it('2.3 Active shares endpoint returns live journey to accepted contact', async () => {
    const res = await request(app)
      .get('/shares/active')
      .set('Authorization', `Bearer ${contactToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBe(shareId);
    expect(res.body[0].lat).toBe(26.8500);
  });

  it('2.4 Acceptance criterion: Stopping share deletes location row and makes public link dead', async () => {
    // Stop the share
    const stopRes = await request(app)
      .post(`/shares/${shareId}/stop`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(stopRes.status).toBe(200);

    // Verify share_locations row is deleted
    const locationRows = await db.query('SELECT * FROM share_locations WHERE share_id = ?', [shareId]);
    expect(locationRows.length).toBe(0);

    // Verify public view link is dead
    const publicRes = await request(app).get(`/v/${viewToken}`);
    expect([404, 410]).toContain(publicRes.status);
  });
});
