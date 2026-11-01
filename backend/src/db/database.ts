import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  run(sql: string, params?: any[]): Promise<{ changes: number; lastID: number }>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

class SQLiteDatabase implements DatabaseAdapter {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new sqlite3.Database(dbPath);
  }

  query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T | undefined);
      });
    });
  }

  run(sql: string, params: any[] = []): Promise<{ changes: number; lastID: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// In-memory or file-backed database instance
let dbInstance: DatabaseAdapter | null = null;

export function getDb(customPath?: string): DatabaseAdapter {
  if (!dbInstance || customPath) {
    const dbPath = customPath || path.join(__dirname, '../../data/ghartak.db');
    dbInstance = new SQLiteDatabase(dbPath);
  }
  return dbInstance;
}

export async function initDb(customPath?: string): Promise<DatabaseAdapter> {
  const db = getDb(customPath);

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      phone_e164 TEXT,
      created_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      fcm_token TEXT NOT NULL,
      platform TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trusted_contacts (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      contact_user_id TEXT,
      name TEXT NOT NULL,
      phone_e164 TEXT NOT NULL,
      status TEXT NOT NULL, -- PENDING, ACCEPTED, REMOVED
      created_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invites (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (contact_id) REFERENCES trusted_contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS share_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      transport TEXT NOT NULL, -- BUS, CAR, TRAIN, AUTO, WALK
      vehicle_number TEXT,
      status TEXT NOT NULL, -- ACTIVE, ENDED
      started_at TEXT NOT NULL,
      ended_at TEXT,
      view_token_hash TEXT UNIQUE NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS share_locations (
      share_id TEXT PRIMARY KEY,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      accuracy_m REAL NOT NULL,
      place_label TEXT,
      captured_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (share_id) REFERENCES share_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS share_audit (
      share_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      transport TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sos_events (
      id TEXT PRIMARY KEY, -- Client UUID v4
      user_id TEXT NOT NULL,
      share_id TEXT,
      pressed_at TEXT NOT NULL,
      received_at TEXT NOT NULL,
      transport TEXT NOT NULL,
      vehicle_number TEXT,
      status TEXT NOT NULL, -- ACTIVE, RESOLVED, EXPIRED
      delivery_channel TEXT NOT NULL, -- INTERNET, SMS_PROMPTED, RETRY_SYNC
      last_lat REAL NOT NULL,
      last_lng REAL NOT NULL,
      place_label TEXT,
      resolved_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sos_recipients (
      sos_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      notified_at TEXT NOT NULL,
      ack_at TEXT,
      renotify_count INTEGER DEFAULT 0,
      PRIMARY KEY (sos_id, contact_id),
      FOREIGN KEY (sos_id) REFERENCES sos_events(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES trusted_contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sos_trail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sos_id TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      captured_at TEXT NOT NULL,
      FOREIGN KEY (sos_id) REFERENCES sos_events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  await db.exec(schema);
  return db;
}
