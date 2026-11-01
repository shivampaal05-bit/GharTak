# GharTak - Implementation Plan

Based on the GharTak Build Specification v1.0 (31 October 2026), this document outlines the project structure, libraries, and phase-by-phase execution plan.

---

## 1. Directory Structure

```
gharTak/
├── ASSUMPTIONS.md
├── IMPLEMENTATION_PLAN.md
├── package.json               # Root workspace orchestrator
├── backend/                   # Node.js + TypeScript (Express, WebSocket, Database, Cleanup)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── config.ts          # Environment variables and retention parameters
│   │   ├── db/
│   │   │   ├── schema.sql     # SQL migration for users, contacts, shares, sos, etc.
│   │   │   ├── database.ts   # Database connection (PostgreSQL with SQLite local fallback)
│   │   │   └── migrations.ts  # Auto-migrator
│   │   ├── middleware/
│   │   │   └── auth.ts        # Bearer JWT verification (15 min expiration)
│   │   ├── routes/
│   │   │   ├── auth.ts        # /auth/google, /auth/refresh, /auth/logout
│   │   │   ├── me.ts          # GET/PATCH /me, DELETE /me, POST /me/devices
│   │   │   ├── contacts.ts    # /contacts, /invites/:token/accept
│   │   │   ├── shares.ts      # POST /shares, PUT /shares/:id/location, POST /shares/:id/stop
│   │   │   ├── publicView.ts  # GET /v/:token (Public web live-view)
│   │   │   ├── sos.ts         # POST /sos, PUT /sos/:id/location, POST /sos/:id/ack, resolve
│   │   │   └── places.ts      # GET /places/context (cached 100m grid for 10 min)
│   │   ├── services/
│   │   │   ├── fcm.ts         # Firebase Cloud Messaging data alerts
│   │   │   ├── cleanup.ts     # 5-minute cleanup job (stale shares, expired invites, retention)
│   │   │   └── websocket.ts   # WS server on /ws (channels share:{id}, sos:{id})
│   │   └── server.ts          # Express + WS entrypoint
│   └── tests/                 # Phase test suite
│       ├── phase1.test.ts     # Auth, profile, contacts, max 5, invite 6h expiry
│       ├── phase2.test.ts     # Live share lifecycle, location upsert, deletion on stop
│       ├── phase3.test.ts     # SOS idempotency, fallback queue, renotify, acknowledge, resolve
│       └── phase4.test.ts     # Places 100m caching, police card, web view token expiry
├── client/                    # Next.js / React application with rich Vanilla CSS
│   ├── package.json
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PhoneFrame.tsx      # Realistic 390x844 dp Android shell preview
│   │   │   ├── StatusBar.tsx       # Android system status bar (battery, time, connectivity)
│   │   │   ├── Navigation.tsx      # In-app bottom/header nav
│   │   │   ├── MapView.tsx         # Interactive Map with live dot, pulse & accuracy ring
│   │   │   └── NotificationToast.tsx
│   │   ├── screens/
│   │   │   ├── S1_Login.tsx        # "Google se login karo", Terms, Privacy link
│   │   │   ├── S2_Profile.tsx      # Name, +91 phone, "Yeh aapka number hai?"
│   │   │   ├── S3_Home.tsx         # Transport chips, vehicle field, share, WA, SOS button
│   │   │   ├── S4_SharingActive.tsx # Status, editable chips, place, stop sharing
│   │   │   ├── S5_SOSCountdown.tsx  # Red #B71C1C, 5..1 countdown, vibration, cancel
│   │   │   ├── S5b_SOSStatus.tsx   # "SOS bheja gaya", delivery states, "Main safe hoon"
│   │   │   ├── S6_TrustedContacts.tsx # Max 5, Pending/Accepted, empty state
│   │   │   ├── S7_ContactPicker.tsx   # Contact permission, multi-select, SMS composer prefill
│   │   │   ├── S8_FamilyView.tsx      # Map, live dot, "Live"/"Purani", Paas mein, Call/Msg
│   │   │   ├── S9_SOSAlertReceiver.tsx # Red header, 64px 112 button, Police card, Dekh liya
│   │   │   └── S10_Settings.tsx       # Privacy policy link, "Mera data delete karo", Logout
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # GharTak marketing site
│   │   │   ├── PrivacyPolicy.tsx   # /privacy compliance page
│   │   │   └── WebLiveView.tsx     # /v/:token public live-view page
│   │   ├── store/
│   │   │   ├── clientQueue.ts      # Local SOS queue (PENDING, SENT_INTERNET, SMS_PROMPTED)
│   │   │   └── appState.ts         # User session, active share, current SOS, offline simulator
│   │   └── styles/
│   │       ├── designTokens.css    # #F6F7FB, #14213D, #4A5568, #0F766E, #B71C1C
│   │       └── index.css           # Global rich styling, glassmorphism, micro-animations
│   └── index.html
└── mobile/                    # Native Android React Native TypeScript project
    ├── package.json
    ├── android/
    └── src/
        ├── services/
        │   ├── ForegroundLocationService.kt
        │   ├── LocalQueue.ts
        │   └── SMSFallback.ts
        └── ...
```

---

## 2. Technology & Libraries

- **Backend**:
  - `express`, `cors`, `dotenv`, `jsonwebtoken`, `ws`, `node-cron`, `uuid`
  - `sqlite3` & `pg` (dual database adapter for zero-friction local run + production Postgres)
  - Testing: `vitest` or `supertest` for REST API & WebSocket tests
- **Frontend / Web & Android App Simulation**:
  - React, TypeScript, Vite / Next.js architecture
  - Styling: Pure Vanilla CSS with CSS custom properties matching exact design tokens
  - Real-time client: WebSocket client + REST polling fallback (10s)
  - Geolocation: Browser Geolocation API + Route simulator (moving dot at 10s intervals)
  - Vibration: HTML5 `navigator.vibrate([200])` on SOS countdown ticks

---

## 3. Phase Breakdown (Section 12)

### Phase 1: Foundations
- Database schema and migrations (`users`, `devices`, `trusted_contacts`, `invites`).
- Auth API (`POST /auth/google`, `POST /auth/refresh`, `POST /auth/logout`).
- Profile API (`GET, PATCH /me`, `DELETE /me`, `POST /me/devices`).
- Contacts API (`GET, POST /contacts`, `POST /invites/{token}/accept`, `DELETE /contacts/{id}`).
- Screens S1 (Login), S2 (Profile), S6 (Trusted Contacts), S7 (Contact Picker).
- **Acceptance Criteria**:
  - A second account can accept an invite only once and within 6 hours.
  - Adding a 6th accepted contact is strictly rejected with 400 Bad Request.

### Phase 2: Live Share
- Share sessions and location tables (`share_sessions`, `share_locations`, `share_audit`).
- Endpoints: `POST /shares`, `PUT /shares/{id}/location` (upsert), `PATCH /shares/{id}`, `POST /shares/{id}/stop`, `GET /shares/active`.
- Screens S3 (Home), S4 (Sharing Active), S8 (Family View).
- WebSocket server and channels `share:{id}`.
- Contact receives push / WS event on start and stop.
- On share stop: `share_locations` row is deleted immediately and view token is invalidated.
- **Acceptance Criteria**:
  - Contact sees moving dot within 15 seconds.
  - After stopping share, location row is deleted and public link is dead.

### Phase 3: SOS
- SOS tables: `sos_events`, `sos_recipients`, `sos_trail`.
- Endpoints: `POST /sos` (idempotent by `sos_id`), `PUT /sos/{id}/location`, `POST /sos/{id}/ack`, `POST /sos/{id}/resolve`, `GET /sos/{id}`.
- Local queue mechanism on mobile/client (`PENDING` -> try internet -> on failure, SMS fallback `SMS_PROMPTED` -> queue retry on reconnect).
- Screens S5 (Countdown with 5..1 animation, vibration, cancel button), S5b (SOS Status with delivery indicators), S9 (SOS Alert Receiver with 112 button).
- Re-notify logic (every 2 min, up to 5 times for unacknowledged contacts).
- **Acceptance Criteria**:
  - With network offline, SMS path triggers immediately.
  - Reconnecting delivers same `sos_id` once with original `pressed_at`.
  - Contacts never get duplicate alerts.

### Phase 4: Places, WhatsApp, Web
- Places and Geocoding service (`GET /places/context?lat&lng`) with 100m grid cache for 10 minutes.
- Police card logic with distance, disclaimer (*"Number verified nahi hai. Galat ho sakta hai, 112 behtar hai."*), phone call button enabled only if `phone_verified=true`.
- 112 button (64px) on receiver screen.
- WhatsApp share button with prefilled message (`wa.me/?text=...`).
- Public web live-view `/v/{token}` (read-only S8/S9).
- Marketing website (`/`) and Privacy Policy page (`/privacy`).
- **Acceptance Criteria**:
  - Place label ("{name} ke paas") and police card appear.
  - Police call button hidden unless `phone_verified` is true.

### Phase 5: Hardening & End-to-End Polish
- Background cleanup job running every 5 minutes:
  - End shares older than 12 hours without update.
  - Remove expired invites.
  - Trim `sos_trail` to retention window (24h).
  - Clean audit logs according to `SHARE_AUDIT_DAYS` and `SOS_RECORD_DAYS`.
- Account deletion (`DELETE /me`) wipes user data, devices, contacts, shares, locations.
- UI visual perfection: responsive 360px-412px layout, contrast ratio >= 4.5:1, micro-animations, audio/vibration feedback.
- Full automated test suite verifying all 5 phases.
