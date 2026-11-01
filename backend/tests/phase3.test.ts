import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { app } from '../src/server';
import { initDb, getDb } from '../src/db/database';

describe('Phase 3: SOS', () => {
  let senderToken: string;
  let senderId: string;
  let contactToken: string;
  let contactUserId: string;
  let db: any;
  const testSosId = uuidv4();

  beforeAll(async () => {
    db = await initDb(':memory:');

    // Sender
    const u1 = await request(app)
      .post('/auth/google')
      .send({ id_token: 'sos_sender', mock_sub: 'sub_sender', mock_email: 'sender@test.com', mock_name: 'Priya' });
    senderToken = u1.body.access_token;
    senderId = u1.body.user.id;

    // Contact
    const u2 = await request(app)
      .post('/auth/google')
      .send({ id_token: 'sos_contact', mock_sub: 'sub_contact', mock_email: 'contact@test.com', mock_name: 'Bhaiya' });
    contactToken = u2.body.access_token;
    contactUserId = u2.body.user.id;

    // Connect them as trusted contact
    const inv = await request(app)
      .post('/contacts')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ name: 'Bhaiya', phone_e164: '+919876522222' });
    const token = inv.body.invite_url.split('/invite/')[1];

    await request(app)
      .post(`/contacts/invites/${token}/accept`)
      .set('Authorization', `Bearer ${contactToken}`);
  });

  afterAll(async () => {
    if (db) await db.close();
  });

  it('3.1 SOS creation with full payload creates active SOS and notifies contact', async () => {
    const pressedAt = '2026-10-31T10:42:07+05:30';
    const res = await request(app)
      .post('/sos')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        sos_id: testSosId,
        pressed_at: pressedAt,
        transport: 'BUS',
        vehicle_number: 'UP32AB1234',
        location: {
          lat: 26.8467,
          lng: 80.9462,
          accuracy_m: 18,
          captured_at: '2026-10-31T10:42:06+05:30',
        },
        place_label: 'City Hospital ke paas',
        trail: [
          { lat: 26.8460, lng: 80.9455, t: '2026-10-31T10:40:00+05:30' },
          { lat: 26.8467, lng: 80.9462, t: '2026-10-31T10:42:06+05:30' },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.sos_id).toBe(testSosId);
    expect(res.body.status).toBe('ACTIVE');
    expect(res.body.delivery_state).toBe('SENT_INTERNET');
    expect(res.body.recipients.length).toBe(1);
    expect(res.body.recipients[0].name).toBe('Bhaiya');
  });

  it('3.2 Acceptance criterion: Idempotency - duplicate POST with same sos_id does not duplicate alerts', async () => {
    // Re-post the same SOS (simulating retry after temporary offline / reconnect)
    const retryRes = await request(app)
      .post('/sos')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        sos_id: testSosId,
        pressed_at: '2026-10-31T10:42:07+05:30',
        transport: 'BUS',
        vehicle_number: 'UP32AB1234',
        location: {
          lat: 26.8475,
          lng: 80.9470,
          accuracy_m: 12,
        },
        place_label: 'City Hospital Gate 2 ke paas',
      });

    expect(retryRes.status).toBe(200);
    expect(retryRes.body.is_update).toBe(true);

    // Verify database has only 1 row in sos_events
    const events = await db.query('SELECT * FROM sos_events WHERE id = ?', [testSosId]);
    expect(events.length).toBe(1);

    // Verify recipients list is NOT duplicated
    const recipients = await db.query('SELECT * FROM sos_recipients WHERE sos_id = ?', [testSosId]);
    expect(recipients.length).toBe(1);
  });

  it('3.3 Live location update during SOS', async () => {
    const res = await request(app)
      .put(`/sos/${testSosId}/location`)
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        lat: 26.8480,
        lng: 80.9480,
        place_label: 'Kapoorthala ke paas',
      });

    expect(res.status).toBe(200);
    expect(res.body.lat).toBe(26.8480);
  });

  it('3.4 Contact taps "Dekh liya" (acknowledge)', async () => {
    const res = await request(app)
      .post(`/sos/${testSosId}/ack`)
      .set('Authorization', `Bearer ${contactToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify in db
    const rec = await db.get('SELECT * FROM sos_recipients WHERE sos_id = ?', [testSosId]);
    expect(rec.ack_at).not.toBeNull();
  });

  it('3.5 User taps "Main safe hoon" (resolve)', async () => {
    const res = await request(app)
      .post(`/sos/${testSosId}/resolve`)
      .set('Authorization', `Bearer ${senderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify resolved in db
    const event = await db.get('SELECT * FROM sos_events WHERE id = ?', [testSosId]);
    expect(event.status).toBe('RESOLVED');
    expect(event.resolved_at).not.toBeNull();
  });
});
