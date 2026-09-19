# BlendIn — App Flow

This document describes the functional flow of the app screen-by-screen and state-by-state. It describes what happens and in what order, not visual layout or styling.

## 1. First Launch / Onboarding

1. App opens to a launch screen while an anonymous device session is established via Supabase Auth (silent, no user action required).
2. Brief onboarding (skippable) explains the core concept: one player gets a different word, hints are given verbally, group votes together.
3. User lands on the Home screen.

## 2. Home Screen

From Home, a user can:
- Start a new game (leads to Game Setup flow).
- Join a game (leads to Join flow — multi-device only).
- Browse the Community Library.
- View/manage their own custom packs.
- Access account/profile and settings.

## 3. Game Setup Flow (Host)

1. Host chooses **play mode**: Single-device (pass-and-play) or Multi-device (room-based).
2. Host chooses **player count**:
   - Single-device: host manually enters number of players and, optionally, player names/nicknames for role announcement.
   - Multi-device: player count is determined dynamically as people join the room (see Section 4).
3. Host selects **category pack(s)** — built-in packs, their own saved custom packs, or favorited Community Library packs. Multiple selections are allowed; the app draws from the combined pool.
4. Host selects **imposter difficulty variant**: Classic Pair, Hint Imposter, Category Only, Blank Imposter, or triggers a one-off All-Imposter (Mirror) Round instead of a standard round.
5. Host selects **imposter count**:
   - If player count < 6: locked to 1 imposter, no selector shown.
   - If player count ≥ 6: option to choose 1 or 2 imposters (unaware of each other) becomes available.
6. Host confirms and starts the game, moving to Role Assignment.

## 4. Multi-Device Room Join Flow

1. Host creates the room (as part of Game Setup) — app generates a short join code and a QR code representing that room.
2. Host's screen displays the QR code and the code as text.
3. Each joining player either:
   - Scans the QR code with their own device's camera (via in-app scanner), or
   - Manually types the join code into their own device.
4. On successful join, the joining player enters a nickname (or confirms an existing profile name) and appears in the host's live player list in real time.
5. Host waits until all expected players have joined, then proceeds to configure round settings as in Section 3 (steps 3–5) and starts the game.
6. Once started, each joined device automatically transitions from "waiting in lobby" to its own private Role Reveal screen — no further manual action needed to receive the role.

## 5. Role Assignment (Backend Event, Both Modes)

1. App (locally for single-device, server-side for multi-device) assigns:
   - The real word to all civilian players.
   - The imposter-variant-appropriate word/hint/category/nothing to the imposter(s).
   - A randomly chosen starting player.
2. Fair-rotation logic considers prior rounds in the current session so the same player isn't repeatedly assigned imposter when avoidable.

## 6. Role Reveal

### Single-Device (Pass-and-Play)
1. App displays a prompt: "Pass the phone to [Player Name]."
2. That player performs a press-and-hold (or equivalent deliberate) action to reveal their word/role.
3. Releasing the action immediately hides it again.
4. Player taps confirm/continue, prompting the app to advance to the next player's pass-the-phone prompt.
5. Once all players have viewed their role, the app announces the starting player and moves to Hint Round.

### Multi-Device
1. Each device automatically shows only its own player's role reveal screen — no passing required.
2. Player taps to reveal, and can toggle it hidden/shown as needed privately on their own device.
3. Once the host confirms all players are ready, the app announces the starting player to everyone and moves to Hint Round.

## 7. Hint Round

1. App displays the round is in progress and who the starting player is. No timer or enforced turn order is shown or applied — players manage pacing and speaking order verbally themselves.
2. Players give their one hint each aloud, in person, outside the app.
3. Once the group agrees hints are done, any player (or the host) taps "Move to Discussion" to advance the app state — this is a manual, player-initiated transition, not automatic.

## 8. Discussion & Resolution

1. App shows a simple "Discuss and decide together" state — no in-app voting UI is used; the group verbally deliberates and reaches consensus outside the app.
2. Once ready, host (or designated round-control player) taps "Reveal Imposter."
3. App reveals who the actual imposter(s) were.
4. App presents two outcome actions: **"Busted!"** (the group correctly identified the imposter) or **"Got Away With It"** (the imposter was not identified).
5. Selecting an outcome triggers the scoring update (Section 9) and advances to the Round Summary.

## 9. Scoring Update
- If "Busted!" is selected: every non-imposter player's score increases by 1.
- If "Got Away With It" is selected: the imposter's score increases by 2.
- Updated scores are written to session state (local for single-device, synced via Realtime for multi-device).

## 10. Round Summary / Between Rounds

1. App displays the updated scoreboard for the session.
2. Host is offered: Play Another Round (returns to Game Setup step 3–5 with the same players, allowing settings changes), Change Players (returns to Section 3/4 setup), or End Session (returns to Home, optionally saving final scores to history).

## 11. Community Library Flow

1. From Home, user opens Community Library.
2. User browses via Trending, Top Rated, New, or By Category views, or searches directly.
3. Selecting a pack opens its detail view: description, category tone tag (Family-friendly/Party-Mature), play count, average rating, creator profile link, and actions to Favorite or Use in a game.
4. "Use in a game" adds the pack into the pool of selectable packs in Game Setup (Section 3, step 3).
5. After a session has used a given pack in at least one completed round, the user becomes eligible to submit a rating for that pack (prompted post-session or accessible from the pack's detail view).
6. A "Report" action is available on each pack's detail view, presenting defined reason options and submitting a report record.

## 12. Custom Pack Creation Flow

1. From Home or Game Setup, user selects "Create Custom Pack."
2. User names the category and enters a list of words/word-groups.
3. Pack is saved to the user's private library, immediately usable in their own games.
4. User may optionally choose "Publish to Community Library," which triggers the submission/moderation pipeline (automated pre-filter, then live or pending-review status) before it becomes publicly browsable.
5. Published packs appear under the user's creator profile, viewable by others from the Community Library.

## 13. Account & Profile Flow

1. New users start fully anonymous (device-based); this is sufficient for all solo/local play and joining games.
2. Prompted account upgrade (email/OAuth) occurs contextually when a user attempts an action that requires it: publishing a pack, favoriting a pack for cross-device access, or viewing a persistent creator profile.
3. Profile screen shows: display name, published packs (if any), favorited packs, and basic session history.

## 14. Settings Flow

- Manage account (linked email/OAuth, sign out).
- Manage saved custom packs (edit, delete, unpublish).
- Manage favorited Community Library packs.
- Report history (packs the user has reported, with acknowledgment status).
- App info/support.
