# BlendIn — Product Requirements Document (PRD)

## 1. Overview

BlendIn is a mobile social-deduction party game for friends playing together in person. One or more players (the "imposters") are secretly given a different word (or no word at all) than the rest of the group. Players take turns giving a single vague hint related to their word, trying to prove they know it without giving it away — while the imposter(s) try to blend in using only what they can infer from other players' hints. The group then discusses and votes on who they believe the imposter is.

The app's job is to remove the friction of manual setup — shuffling paper, whispering words, tracking who's had a turn — and replace it with an instant, trustworthy way to assign secret roles, run games on a single passed-around phone or across multiple phones, and keep a session scoreboard.

## 2. Problem Statement

Groups currently play this style of game using paper slips, a physical "imposter card" deck, or ad hoc verbal systems (e.g. "someone types it into their notes app and shows everyone individually"). This is slow to set up, easy to cheat/peek, hard to scale to larger groups, and has no persistent scoring or content variety beyond what the group brings with them.

## 3. Goals

- Make starting a round take under 30 seconds regardless of group size.
- Guarantee secrecy of role/word assignment (no accidental reveals, no host bias).
- Support both a single shared device (pass-and-play) and each player using their own phone.
- Provide enough built-in content (categories/word packs) that a group never needs outside prep.
- Let the game grow through user-generated content (custom + community word packs) without requiring app updates.
- Keep the actual gameplay — hints, discussion, voting — fully verbal and player-paced; the app should never rush or referee the social part of the game.

## 4. Non-Goals (v1)

- No enforced timers or turn-order automation — players self-manage pacing and speaking order.
- No AI-generated hints, AI imposter, or single-player mode.
- No video/voice chat features (the game assumes players are physically together).
- No web version at launch (iOS + Android only).

## 5. Target Audience

- Friend groups and families looking for a low-prep party/icebreaker game, typically played at gatherings, game nights, road trips, or waiting-around downtime.
- Casual mobile gamers who enjoy social deduction games (Mafia/Werewolf, Spyfall, Among Us-style deduction) but want something faster and lower-commitment per round.

## 6. Core Gameplay Loop

1. Host starts a new game and chooses settings (imposter difficulty variant, category selection, player count, imposter count).
2. App assigns roles/words to all players and announces a starting player (no imposed turn timer or enforced order beyond who starts).
3. Players verbally give one hint each, in whatever order they choose, trying to prove they know the real word.
4. After all players have given a hint, the group discusses openly and reaches a verbal consensus/vote on who they think the imposter is (this happens outside the app).
5. Host taps to reveal who the actual imposter was.
6. Host logs the outcome via two options: **Busted!** (imposter correctly identified) or **Got Away With It** (imposter not identified).
7. App updates the running scoreboard and offers to start the next round.

## 7. Feature Requirements

### 7.1 Game Setup
- Host selects number of players (manually entered for single-device, or auto-counted as people join for multi-device).
- Host selects category pack(s) to draw words from (multi-select supported).
- Host selects an imposter difficulty variant (see 7.2).
- Host selects imposter count: locked to 1 imposter if fewer than 6 players; option to select 2 imposters (who are not told who the other is) unlocks at 6+ players.
- Host can optionally enable the "All-Imposter Round" as a one-off special round instead of a standard round.

### 7.2 Imposter Difficulty Variants
Selectable per game/round:
1. **Classic Pair** — Imposter(s) receive a related decoy word instead of the real word (closeness of decoy to real word is tunable: easy/medium/hard).
2. **Hint Imposter** — Imposter(s) receive a vague clue/hint instead of a full word.
3. **Category Only** — Imposter(s) see only the category name, not any word.
4. **Blank Imposter** — Imposter(s) receive nothing at all.
5. **All-Imposter (Mirror) Round** — Every player is secretly an imposter; each receives a different but related word from the same category. There are no "civilians" this round. Resolution goal shifts from finding an imposter to identifying who shares the closest word to your own, or guessing what others were given.

### 7.3 Role Assignment & Fair Rotation
- Role assignment (who is the imposter) must rotate fairly across a session so the same player isn't repeatedly chosen when possible, given the group composition.
- Role/word data must never be visible to anyone except the assigned player.

### 7.4 Play Modes
- **Single-device pass-and-play**: One phone is passed around. Each player reveals their own role privately (press-and-hold or similar reveal-then-auto-hide interaction), then passes to the next player. Fully functions offline — no network dependency.
- **Multi-device**: Host creates a room; other players join via a QR code displayed on the host's screen or by entering a short room code manually. Each player's role is delivered privately to their own device. Requires network connectivity for all joined devices.

### 7.5 Round Resolution & Scoring
- No in-app voting mechanic — voting/discussion happens verbally among players.
- Host (or any player) taps to reveal the actual imposter(s) once the group has reached consensus.
- Two outcome buttons are presented: "Busted!" (imposter identified) and "Got Away With It" (imposter not identified).
- Scoring rule: if busted, every non-imposter player earns +1 point; if not busted, the imposter earns +2 points.
- A running scoreboard persists across all rounds played within a session and is visible between rounds.

### 7.6 Word Categories & Packs
- Built-in category packs at launch: Actors, Movies, Anime, Food, Animals, Everyday Objects (expandable post-launch: Sports, Places, Music/Bands, Video Games, Brands, Historical Figures, etc.).
- Each category pack contains a list of word pairs/groups tuned for use across all difficulty variants (i.e. enough related words per entry to generate decoys, hints, and mirror-round variations).

### 7.7 Custom Word Packs
- Any user can create a custom pack by entering their own category name and word list.
- Custom packs are usable privately without publishing.
- Users may optionally publish a custom pack to the Community Library.

### 7.8 Community Library
- Browsable, searchable library of user-published word packs.
- Sorting/discovery views: Trending, Top Rated, New, By Category.
- Each pack displays a play-count badge.
- Users can favorite/bookmark packs into their personal library for quick reuse.
- Users can rate a pack (lightweight rating), but only after having used it in an actual game session (prevents rating without playing).
- Pack creators have a visible profile listing their other published packs.
- Creators can self-tag a pack's content tone (e.g. Family-friendly vs Party/Mature).

### 7.9 Moderation & Reporting
- Every community pack has a report action with defined reasons (e.g. inappropriate content, spam/low effort, offensive, duplicate).
- An automated basic profanity/slur pre-filter runs at submission time before a pack goes live.
- Reports beyond a defined threshold auto-hide a pack pending review; report weight is adjusted by reporter diversity (reports from users who haven't played together as a group count more than reports clustered from the same play session/social graph) to reduce brigading.
- A manual review queue allows an admin to approve, edit, or remove flagged packs.
- Repeat-offender creators (packs repeatedly removed) are automatically restricted to requiring manual approval on future submissions rather than being banned outright on a first offense.
- Reporters receive a lightweight acknowledgment that their report was received.

### 7.10 Accounts
- Anonymous/device-based play is supported for casual use — no forced signup to create or join a game.
- Account creation/upgrade is required only to publish a pack to the Community Library, favorite packs across devices, or maintain a persistent cross-device profile.

## 8. Branding

- **Name**: BlendIn
- **Color palette**: Navy (base), light blue (secondary), orange (accent — used consistently to represent "the odd one out"/imposter across UI and both logo marks)
- **Logo concepts**: (a) a grid of same-colored dots with one differently colored dot standing out (Blend In mark); (b) a row of tiles/shapes with one differing tile (Odd Word Out mark). Final logo direction to be resolved separately from this PRD; this document intentionally avoids prescribing UI layout.

## 9. Success Metrics (initial)

- Average session length (rounds played per session).
- % of sessions using multi-device vs single-device pass-and-play.
- Community Library adoption: packs published per active user, packs favorited/used per week.
- Report-to-removal ratio (moderation health signal).
- Retention: sessions per returning user per month.

## 10. Roadmap Beyond v1

Deferred from v1 groundwork discussion, candidates for v1.1+:
- Optional round timers/rapid-fire mode.
- Silent/simultaneous written-hint round.
- Elimination-style voting variant.
- Custom deck import/export sharing outside the Community Library.
- In-app purchases / monetization strategy (undecided as of this document).
