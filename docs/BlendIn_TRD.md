# BlendIn — Technical Requirements Document (TRD)

## 1. Purpose

This document defines the technical architecture, stack, and system behavior required to implement the BlendIn PRD. It intentionally excludes UI/visual design constraints — those are covered separately.

## 2. Platform Targets

- iOS and Android only for v1. No web target.
- Minimum supported OS versions to be confirmed against Expo SDK's currently supported baseline at build time.

## 3. Technology Stack

### 3.1 Client
- **Framework**: React Native, managed via **Expo** (managed workflow).
- **Build/Distribution**: EAS Build for producing App Store and Play Store binaries; EAS Update for over-the-air JS updates between store releases.
- **Navigation**: React Navigation.
- **State management**: Zustand for local/global app state (game phase, current players, assigned roles, scoreboard). Local component state used where state does not need to be shared across screens.
- **QR functionality**:
  - `expo-camera` for scanning a host's QR code to join a multi-device room.
  - `react-native-qrcode-svg` (or equivalent) for rendering the host's join QR code.
- **Local persistence**: Device-local storage (e.g. Expo SecureStore / AsyncStorage) for anonymous device identity, session scoreboard cache, and offline-created custom packs pending sync.

### 3.2 Backend — Supabase
- **Database**: Supabase-managed Postgres. Chosen over a NoSQL alternative specifically because the Community Library's discovery/sorting requirements (trending, top-rated with minimum play-count thresholds, reporter-diversity-weighted moderation) are naturally expressed as relational SQL queries.
- **Realtime**: Supabase Realtime (Postgres change subscriptions / broadcast channels) for multi-device room sync — player join events, role assignment delivery, round state changes.
- **Auth**: Supabase Auth. Anonymous sessions by default (device-based); optional upgrade path to a persistent account (email or OAuth) required only for publishing packs or cross-device library sync.
- **Edge Functions**: Serverless functions for:
  - Word/role assignment logic (server-authoritative, so no client can infer other players' roles from local computation).
  - Moderation logic: profanity pre-filter check on pack submission, report-threshold evaluation with reporter-diversity weighting, auto-hide trigger.
  - Rating eligibility check (confirm a user has an associated play record for a pack before accepting a rating).
- **Storage**: Supabase Storage, reserved for optional pack cover images/assets if introduced.
- **Row Level Security (RLS)**: Enabled on all tables containing user-generated or role-sensitive data. Policies must guarantee a device/user can only read the role/word data addressed to their own player record within a room, never another player's.

## 4. Architecture Overview

```
┌──────────────────────┐        ┌──────────────────────┐
│  Client (Expo RN)     │        │  Client (Expo RN)     │
│  Player / Host device │        │  Joining player device│
└──────────┬────────────┘        └──────────┬────────────┘
           │  REST / Realtime WS             │ REST / Realtime WS
           ▼                                  ▼
                 ┌───────────────────────────────┐
                 │        Supabase Platform        │
                 │  ┌─────────────┐ ┌────────────┐ │
                 │  │  Postgres   │ │  Realtime   │ │
                 │  └─────────────┘ └────────────┘ │
                 │  ┌─────────────┐ ┌────────────┐ │
                 │  │   Auth      │ │Edge Functions│ │
                 │  └─────────────┘ └────────────┘ │
                 │  ┌─────────────┐                │
                 │  │  Storage    │                │
                 │  └─────────────┘                │
                 └───────────────────────────────┘
```

## 5. Play Mode Implementation

### 5.1 Single-Device (Pass-and-Play)
- Fully local: no network call required to run the round once category/word data has been fetched or is available from a locally cached built-in pack.
- Role/word assignment computed client-side using a fair-rotation algorithm seeded per session.
- Each player's word/role is held only in transient in-memory state and displayed exclusively during that player's own reveal interaction; state is cleared from view immediately on hide.
- No round data needs to sync to the backend unless the session later chooses to use a Community Library pack (requires a one-time fetch) or the user wants scores to persist across devices/sessions.

### 5.2 Multi-Device (Room-Based)
- Host device calls an Edge Function to create a room row in Postgres, generating a short alphanumeric join code and a QR-encodable payload (room code + optional room metadata).
- Joining devices either scan the QR code (decoded client-side, then used to call the join endpoint) or manually enter the room code.
- On round start, a server-side Edge Function performs role/word assignment (never client-side, to prevent any device from being able to infer other roles) and writes per-player role rows with RLS restricting each row's visibility to its owning player/device only.
- Realtime channel per room broadcasts non-sensitive state changes (e.g. "round started," "player joined," "round resolved") to all connected devices; sensitive role/word data is fetched directly by each client via a row-level-secured query, not broadcast over the shared channel.
- Reconnection handling: if a device disconnects/reconnects mid-round, it must be able to re-fetch its own current role state from Postgres rather than relying on a replayed broadcast.

## 6. Round & Scoring Data Flow
1. Host configures round settings (category selection, difficulty variant, imposter count) — validated against player count rules (imposter count capped to 1 below 6 players).
2. Role assignment executes (client-side for single-device; Edge Function for multi-device).
3. Players view/hide their own roles.
4. No app-enforced turn order or timer; app only displays which player was designated as the starting player.
5. After verbal group discussion, host (or any device with round-control permission) submits the actual imposter reveal action.
6. App presents outcome logging ("Busted!" / "Got Away With It"); the result is written to a `round_results` record and used to update the session scoreboard.
7. Scoreboard state updates propagate to all devices in a multi-device room via Realtime; in single-device mode it simply updates local state.

## 7. Community Library & Moderation — Technical Requirements

- Pack publishing triggers a submission pipeline: client submit → Edge Function profanity/basic content pre-filter → insert into `word_packs` with a `pending` or `published` status depending on filter result.
- Reporting: each report is stored with reporter identity, timestamp, and reason. An Edge Function periodically (or on each new report) evaluates whether the auto-hide threshold has been met, weighting reports by distinctness of the reporting users' social/session graph rather than raw report count.
- Rating eligibility is enforced server-side: a rating submission is only accepted if a corresponding play record exists linking that user/device to that pack.
- Sorting queries (Trending, Top Rated, New, By Category) are implemented as SQL queries/materialized views over play counts, rating aggregates, and publish timestamps — not computed client-side.
- Admin review queue is a protected view/route restricted to admin-role accounts via RLS/role checks, not exposed in the general client app.

## 8. Security & Privacy Requirements

- No player's role/word may be transmitted or stored in a way readable by any other player's device or session.
- Anonymous device identities must not be treated as authoritative for identity-sensitive actions (e.g. publishing content, receiving repeat-offender restrictions) — these require the upgraded account path.
- All Supabase table access governed by RLS; no table should be globally readable/writable without a policy check.
- Rate limiting on room creation and pack submission endpoints to mitigate abuse (e.g. spam room creation, spam pack publishing).

## 9. Offline & Resilience Considerations

- Single-device mode must be fully playable with no network connection once the app and at least the built-in word packs are installed/cached locally.
- Built-in category packs should ship bundled with the app (or cached on first launch) rather than requiring a live fetch every session.
- Supabase free-tier project pausing after a period of inactivity is a known operational risk for multi-device mode; mitigation (scheduled keep-alive ping, or upgrading to a paid Supabase plan) is deferred as an infrastructure decision outside this document's v1 scope, but the client should handle a "backend unreachable" state gracefully (e.g. clear error messaging, fallback suggestion to use single-device mode) rather than failing silently.

## 10. Build, Release & Environments

- Separate Supabase projects (or schemas) recommended for development/staging vs production to avoid test data/moderation actions affecting live users.
- EAS Build profiles for development, preview (internal testing), and production.
- Environment-specific config (Supabase URL/anon key per environment) managed via Expo config/env files, not hardcoded.

## 11. Testing Requirements

- Unit tests for role-assignment fairness/rotation logic and scoring calculation.
- Integration tests for the multi-device room join → role delivery → RLS isolation path (verifying one device cannot read another's role row).
- Manual/exploratory test pass for pass-and-play reveal/hide interaction across interruption scenarios (app backgrounded mid-reveal, etc.).
- Moderation pipeline tests: profanity pre-filter accuracy, report-threshold auto-hide behavior under both clustered and diverse reporter scenarios.
