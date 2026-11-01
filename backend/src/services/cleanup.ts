import cron from 'node-cron';
import { getDb } from '../db/database';
import { config } from '../config';
import { wsManager } from './websocket';

export async function runCleanupJob(): Promise<{
  staleSharesEnded: number;
  expiredInvitesRemoved: number;
  trailRowsTrimmed: number;
  renotifiedRecipients: number;
}> {
  const db = getDb();
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. End stale shares: active shares older than 12 hours without any update
  const staleThreshold = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
  const staleShares = await db.query<any>(
    `SELECT ss.id FROM share_sessions ss
     LEFT JOIN share_locations sl ON sl.share_id = ss.id
     WHERE ss.status = "ACTIVE" AND (sl.updated_at < ? OR (sl.updated_at IS NULL AND ss.started_at < ?))`,
    [staleThreshold, staleThreshold]
  );

  let staleSharesEnded = 0;
  for (const s of staleShares) {
    await db.run('UPDATE share_sessions SET status = "ENDED", ended_at = ? WHERE id = ?', [nowIso, s.id]);
    await db.run('DELETE FROM share_locations WHERE share_id = ?', [s.id]);
    await db.run('UPDATE share_sessions SET view_token_hash = ? WHERE id = ?', [`EXPIRED_${s.id}`, s.id]);
    wsManager.broadcast(`share:${s.id}`, 'ended', { status: 'ENDED', reason: 'Stale auto-end' });
    staleSharesEnded++;
  }

  // 2. Remove expired invites (older than expires_at and not used)
  const inviteRes = await db.run('DELETE FROM invites WHERE expires_at < ? AND used_at IS NULL', [nowIso]);
  const expiredInvitesRemoved = inviteRes.changes;

  // 3. Trim sos_trail older than SOS_TRAIL_HOURS (default 24h)
  const trailThreshold = new Date(now.getTime() - config.sosTrailHours * 60 * 60 * 1000).toISOString();
  const trailRes = await db.run('DELETE FROM sos_trail WHERE captured_at < ?', [trailThreshold]);
  const trailRowsTrimmed = trailRes.changes;

  // 4. Re-notify unacknowledged contacts for active SOS events
  // "contacts who have not tapped 'Dekh liya' are re-notified every 2 minutes, up to 5 times (configurable)"
  const renotifyThreshold = new Date(now.getTime() - config.renotifyIntervalSec * 1000).toISOString();
  const unacknowledged = await db.query<any>(
    `SELECT sr.sos_id, sr.contact_id, sr.renotify_count, se.user_id, se.transport, se.vehicle_number, se.place_label
     FROM sos_recipients sr
     JOIN sos_events se ON sr.sos_id = se.id
     WHERE se.status = "ACTIVE"
       AND sr.ack_at IS NULL
       AND sr.renotify_count < ?
       AND sr.notified_at < ?`,
    [config.renotifyMax, renotifyThreshold]
  );

  let renotifiedRecipients = 0;
  for (const rec of unacknowledged) {
    const nextCount = rec.renotify_count + 1;
    await db.run(
      'UPDATE sos_recipients SET renotify_count = ?, notified_at = ? WHERE sos_id = ? AND contact_id = ?',
      [nextCount, nowIso, rec.sos_id, rec.contact_id]
    );

    wsManager.broadcast(`sos:${rec.sos_id}`, 'sos_renotify', {
      sos_id: rec.sos_id,
      contact_id: rec.contact_id,
      renotify_count: nextCount,
      timestamp: nowIso,
    });
    renotifiedRecipients++;
  }

  return {
    staleSharesEnded,
    expiredInvitesRemoved,
    trailRowsTrimmed,
    renotifiedRecipients,
  };
}

export function startScheduler() {
  // Run every 5 minutes: '*/5 * * * *'
  cron.schedule('*/5 * * * *', async () => {
    try {
      await runCleanupJob();
    } catch (err) {
      console.error('[Cleanup Job Error]:', err);
    }
  });
}
