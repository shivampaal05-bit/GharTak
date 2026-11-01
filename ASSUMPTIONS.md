# GharTak - Assumptions (ASSUMPTIONS.md)

As per Section 0 of the GharTak Build Specification v1.0, this document records all assumptions and simplest safe options chosen for ambiguous or environment-dependent specifications:

1. **Database Support (PostgreSQL & Local Development)**
   - **Specification**: PostgreSQL. Plain lat/lng columns.
   - **Choice**: The backend database layer uses a dual-mode SQL adapter: if `DATABASE_URL` is set to a PostgreSQL connection string (`postgres://` or `postgresql://`), it connects via `pg` (PostgreSQL); otherwise, it automatically initializes a local zero-dependency SQLite database file (`ghartak.db`) using identical schema, table constraints, and queries. This guarantees 100% testability and instant execution out-of-the-box on developer and CI machines without requiring a pre-installed Docker/PostgreSQL service.

2. **Accidental Tap Guard for SOS (Section 7)**
   - **Specification**: "Guard against accidental taps: SOS needs a long press of 1 s or a deliberate tap on the large button followed by the countdown (pick one, record in ASSUMPTIONS.md)."
   - **Choice**: A deliberate tap on the prominent SOS button immediately initiates the 5-second full-screen countdown (Screen S5) with an animated circular progress indicator, tactile vibration per second, and a prominent 56px white "Cancel" button. This prevents any accidental instant alert while allowing rapid one-touch emergency activation without waiting through a prolonged 1-second press under distress.

3. **Google Sign-In Verification (Section 3 & 9)**
   - **Specification**: "Backend verifies the Google ID token, then issues its own JWT (15 min) and rotating refresh token."
   - **Choice**: In production, the backend verifies the ID token using the official Google OAuth2 client or public Google tokeninfo API. In development/testing mode (or if `GOOGLE_CLIENT_ID` is unset / set to `test` or `mock`), the backend accepts a simulated ID token payload `{ "id_token": "mock-token-user1", "email": "user1@example.com", "name": "Priya Sharma" }` allowing seamless end-to-end automated testing and browser simulation.

4. **SMS Dispatch (Section 4 & 7)**
   - **Specification**: Google Play restricts `SEND_SMS`. Default implementation opens SMS composer prefilled (`sms:?body=...`).
   - **Choice**: In the mobile/web client, fallback and invite SMS actions trigger `sms:{number}?body={encodedText}` (or deep link / prefilled composer UI preview). When `SMS_SILENT_SEND_ENABLED=true` is set on native Android with permissions, direct background SMS is enabled.

5. **Places and Police Station Geocoding (Section 9)**
   - **Specification**: Google Places (New) and Geocoding called only from backend, cached by ~100m grid for 10 min. Nearest police place found; `phone_verified` stays `false` unless from verified list.
   - **Choice**: The backend implements an in-memory / persistent 100m grid cache (rounded to ~0.001 deg). If `GOOGLE_PLACES_API_KEY` is not provided, it falls back to an intelligent local reverse-geocoding database / OpenStreetMap Nominatim / mock safety station registry with realistic landmarks ("ke paas") and nearest police stations (with `phone_verified: false` by default, displaying the required disclaimer: *"Number verified nahi hai. Galat ho sakta hai, 112 behtar hai."*).

6. **Hinglish UI Strings Integrity (Section 0 & 5)**
   - **Specification**: "User-facing text is in Hinglish (Hindi written in English letters). Keep the exact UI strings given here. Code, comments and docs stay in English."
   - **Choice**: All user-facing strings strictly match the specification (e.g., "Aap kisme baithe ho?", "Road par khade ho toh khali chhod do", "Sharing rokein", "SOS bhej rahe hain", "Main safe hoon", "112 par call karo", "Dekh liya", "Mera data delete karo").

7. **Custom / "Other" Transport Option (User Requested Feature)**
   - **Specification**: Card "Aap kisme baithe ho?" with single-select chips Bus, Car, Train, Auto, Paidal.
   - **Choice**: Added an **"Other"** chip with a dedicated input field: *"Specify transport (e.g. Metro, Bike, E-Rickshaw)"*. This enables users to describe any alternative transport mode (e.g., Metro, Bike, Scooty, E-Rickshaw, Ferry/Boat). The custom string is seamlessly propagated to the Live Share session, SOS fallback alerts, SMS messages, and Family/Receiver screens.

8. **Simple English UI Localization (User Requested Feature)**
   - **Specification**: User-facing text originally in Hinglish.
   - **Choice**: Per user request, all user-facing strings across all screens (S1-S10, Public Live View, Marketing page, Privacy Policy, toast messages, and emergency alerts) have been localized into clear, simple, and intuitive English (e.g. *"Share Live Location"*, *"How are you travelling?"*, *"I Am Safe"*, *"Stop Sharing"*, *"Call 112 (Emergency Police)"*, *"Delete My Account & Data"*) making the application effortless and universally understandable for every user.
