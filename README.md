# GharTak (घर तक) 🛡️

**Safety-First Android App & Web Companion**  
*Built strictly in accordance with GharTak Build Specification v1.0 (31 October 2026).*

---

## 🌟 Overview & Core Principles

1. **Safety Reliability Beats Everything Else**: SOS is never blocked by login state, slow network, location lookup failure, or API errors.
2. **Offline Fallback Chain**: Internet Push &rarr; SMS Fallback &rarr; Phone Local Queue Retry upon reconnection.
3. **Honest Wording**: Places are identified as `"... ke paas"` (near), never as an exact claim.
4. **Privacy-Minimal & Zero History**: Contacts see only the current location point. When a share ends, the location row is **immediately deleted** from the server and the view token is invalidated.
5. **Direct Emergency Dialer (112)**: Prominent 64px emergency call button on receiver screens.

---

## 🏗️ Architecture & Folder Structure

```
gharTak/
├── ASSUMPTIONS.md           # Formal record of all technical choices & safe options
├── IMPLEMENTATION_PLAN.md   # Detailed 5-phase execution plan
├── package.json             # Root orchestrator (concurrent dev & test runner)
│
├── backend/                 # Node.js + TypeScript REST & WebSocket Server
│   ├── src/
│   │   ├── config.ts        # Environment variables & configurable retention limits
│   │   ├── server.ts        # Express + WebSocket entrypoint
│   │   ├── db/              # Dual SQL adapter (PostgreSQL + SQLite zero-friction fallback)
│   │   ├── routes/          # /auth, /me, /contacts, /shares, /sos, /places, /v
│   │   └── services/        # 5-min Cleanup Cron, WebSocket Manager
│   └── tests/               # 19 automated integration tests covering Phases 1 to 4
│
├── client/                  # Interactive Next.js/Vite Web App & Android Simulator
│   ├── src/
│   │   ├── screens/         # S1 through S10 (Pixel-perfect matching 390x844 dp)
│   │   │   ├── S1_Login.tsx          # "Google se login karo", Terms/Privacy
│   │   │   ├── S2_Profile.tsx        # "Yeh aapka number hai?" with Sahi hai / Badlo
│   │   │   ├── S3_Home.tsx           # Transport chips (Bus/Car/Train/Auto/Paidal), Vehicle number, SOS
│   │   │   ├── S4_SharingActive.tsx  # Status, editable chips, place line, "Sharing rokein"
│   │   │   ├── S5_SOSCountdown.tsx   # Red #B71C1C, 5..1 animation, vibration, cancel
│   │   │   ├── S5b_SOSStatus.tsx     # "SOS bheja gaya", delivery states, "Main safe hoon"
│   │   │   ├── S6_TrustedContacts.tsx# Pending/Accepted list, Max 5, empty state
│   │   │   ├── S7_ContactPicker.tsx  # Phone contacts search, manual number entry fallback
│   │   │   ├── S8_FamilyView.tsx     # Top map with live dot, "Live"/"Purani", Call/Message
│   │   │   ├── S9_SOSAlertReceiver.tsx# Red header, 64px 112 button, Police card with disclaimer
│   │   │   └── S10_Settings.tsx      # Privacy link, "Mera data delete karo"
│   │   ├── pages/
│   │   │   ├── MarketingPage.tsx     # Landing page (/)
│   │   │   ├── PrivacyPage.tsx       # Privacy policy (/privacy) with Section 10 rules
│   │   │   └── WebLiveView.tsx       # Public read-only live view (/v/[token])
│   │   └── styles/
│   │       ├── designTokens.css      # #F6F7FB, #14213D, #0F766E, #B71C1C
│   │       └── index.css             # Rich styling, glassmorphism, animations
│
└── mobile/                  # Native Android React Native & Kotlin Architecture
    └── src/services/
        ├── ForegroundLocationService.kt # Android Foreground Service ("GharTak: location share ho rahi hai")
        ├── LocalSOSQueue.ts             # Encrypted local persistence queue
        └── SMSFallback.ts               # SMS Composer trigger with coordinates
```

---

## 🚀 Running the Project

### 1. Run Automated Test Suite (100% Passing)
```bash
cd backend
npm test
```
*Executes all 19 integration tests in Vitest covering Phases 1, 2, 3, and 4.*

### 2. Start the Backend API & WebSocket Server
```bash
cd backend
npm run dev
```
*Backend starts on `http://localhost:4000` with WebSocket endpoint on `ws://localhost:4000/ws`.*

### 3. Start the Interactive Frontend & Android Simulator
```bash
cd client
npm run dev
```
*Opens interactive client on `http://localhost:3000`.*

---

## 📱 Interactive Simulator Capabilities

- **Screen Router**: Jump directly to any screen (`S1` to `S10`) or navigate naturally through the full journey.
- **Network Conditioner**: Toggle between **Online (4G)** and **Airplane Mode (Offline)** to test the automatic SMS fallback chain.
- **GPS Simulation**: Real coordinates progressing through Hazratganj and MG Road every 10 seconds.
- **Public Web Viewer (`/v/[token]`)**: View how recipients without the mobile app track journeys in real time.
- **Accidental Guard & Vibration**: Full 5-second countdown with pulse waves, device vibration simulation, and 56px white Cancel button.
- **Safety 112 Dialer**: Instant dialer and verified distance to the nearest police thana with disclaimer.
