import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { initDb, getDb } from '../src/db/database';

describe('Phase 4: Places, Police Card, WhatsApp and Public Web Live View', () => {
  let userToken: string;
  let shareId: string;
  let viewToken: string;
  let db: any;

  beforeAll(async () => {
    db = await initDb(':memory:');

    const u = await request(app)
      .post('/auth/google')
      .send({ id_token: 'p4_user', mock_sub: 'p4_sub', mock_email: 'p4@test.com', mock_name: 'Priya' });
    userToken = u.body.access_token;

    const share = await request(app)
      .post('/shares')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ transport: 'AUTO', vehicle_number: 'UP32XY9999' });

    shareId = share.body.share_id;
    viewToken = share.body.view_token;

    await request(app)
      .put(`/shares/${shareId}/location`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ lat: 26.8467, lng: 80.9462, accuracy_m: 10, place_label: 'City Hospital ke paas' });
  });

  afterAll(async () => {
    if (db) await db.close();
  });

  it('4.1 Places context endpoint returns nearby place name and police station', async () => {
    const res = await request(app).get('/places/context?lat=26.8467&lng=80.9462');

    expect(res.status).toBe(200);
    expect(res.body.place_label).toContain('ke paas');
    expect(res.body.police_station).toBeDefined();
    expect(res.body.police_station.name).toBeDefined();
    expect(res.body.police_station.distance_m).toBeGreaterThan(0);
    // Acceptance criterion: phone_verified stays false unless verified list
    expect(res.body.police_station.phone_verified).toBe(false);
  });

  it('4.2 100m grid caching: same coordinates return cached response', async () => {
    const res1 = await request(app).get('/places/context?lat=26.8467&lng=80.9462');
    // slight variation within 100m grid (~0.0003 deg)
    const res2 = await request(app).get('/places/context?lat=26.8468&lng=80.9463');

    expect(res2.status).toBe(200);
    expect(res2.body.place_label).toBe(res1.body.place_label);
    expect(res2.body.cached).toBe(true);
  });

  it('4.3 Public web live view /v/:token returns live journey data without auth header', async () => {
    const res = await request(app).get(`/v/${viewToken}`);

    expect(res.status).toBe(200);
    expect(res.body.share_id).toBe(shareId);
    expect(res.body.transport).toBe('AUTO');
    expect(res.body.vehicle_number).toBe('UP32XY9999');
    expect(res.body.location.place_label).toBe('City Hospital ke paas');
  });
});
