import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'ghartak-super-secret-jwt-key-2026',
  jwtExpiresIn: '15m',
  refreshExpiresInDays: 30,
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'test-google-client-id',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  fcmServiceAccount: process.env.FCM_SERVICE_ACCOUNT || '',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
  inviteTtlHours: parseInt(process.env.INVITE_TTL_HOURS || '6', 10),
  renotifyIntervalSec: parseInt(process.env.RENOTIFY_INTERVAL_SEC || '120', 10),
  renotifyMax: parseInt(process.env.RENOTIFY_MAX || '5', 10),
  shareAuditDays: parseInt(process.env.SHARE_AUDIT_DAYS || '365', 10),
  sosRecordDays: parseInt(process.env.SOS_RECORD_DAYS || '365', 10),
  sosTrailHours: parseInt(process.env.SOS_TRAIL_HOURS || '24', 10),
  smsSilentSendEnabled: process.env.SMS_SILENT_SEND_ENABLED === 'true',
};
