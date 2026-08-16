# ✅ Iliya — Task Checklist (Phase 1)

> This file is maintained by Iliya. Check off each item as you complete it.

---

## 🎵 Music Player — highest-value section (800 pts)

The player lives in the main layout footer (`app/(main)/layout.tsx`).
A placeholder already exists at `components/player/PlayerPlaceholder.tsx` — replace it.

**Recommended audio library:** `howler.js` (already in `package.json`)

---

### 🖥️ Desktop Player (fixed bar at the bottom of the page)

**Left section — track info:**
- [x] Cover image (56×56 px) — if `coverUrl` is null, show a gradient placeholder with the track title
- [x] Track title (truncate with ellipsis if too long)
- [x] Artist name — clickable, navigates to `/artist/[id]`
- [x] Album name — clickable, navigates to album page (only if track has an album)
- [x] Stream count + unique listeners (visible to Gold subscribers only)

**Center section — playback controls:**
- [x] Play / Pause button (`usePlayerStore.resume` / `pause`)
- [x] Next track button (`usePlayerStore.next`)
- [x] Previous track button (`usePlayerStore.prev`) — if less than 3 seconds in, restart the current track instead
- [x] Progress bar:
  - [x] Display elapsed / total time (e.g. `1:23 / 3:45`)
  - [x] Click or drag to seek
- [x] Repeat button — cycles through 3 modes: `none → all → one`, with a different icon per mode
- [x] Shuffle button — toggle on/off

**Right section — options:**
- [x] Volume slider (0–100)
- [x] Mute / unmute button
- [x] Queue panel toggle button
- [x] Lyrics panel toggle button (only shown if `track.lyrics !== null`)

---

### 📱 Mobile Player

- [x] **Mini Player** (collapsed bar at the bottom):
  - [x] Small cover + track title + play/pause button
  - [x] Tapping the bar expands to the fullscreen player
- [x] **Fullscreen Player** (slide-up overlay):
  - [x] Large cover art
  - [x] All desktop controls
  - [x] Close button (slide down)
  - [x] Swipe down gesture to close (optional)

---

### 📋 Queue Panel (slide-in panel)

- [x] List of upcoming tracks in the queue
- [x] Each row: track title + artist name + duration
- [x] Currently playing track highlighted with `--color-primary`
- [x] Click any track in the queue to play it immediately
- [x] Close button for the panel

---

### 📝 Lyrics Panel

- [x] If `track.lyrics !== null`: render lyrics with a readable font and good line spacing
- [x] If no lyrics: empty state with message "No lyrics available for this track"
- [x] Auto-scroll to the current line (optional — extra credit)

---

### 🔊 Audio Integration (Howler.js)

```ts
import { Howl } from 'howler';

// Create a new Howl instance whenever currentTrack changes
// Update progress in the store every 250ms using setInterval
// Clear the interval when the track changes or the component unmounts
```

- [x] Create `useHowler` hook in `lib/hooks/useHowler.ts`
- [x] Start playback when `isPlaying === true`
- [x] Pause playback when `isPlaying === false`
- [x] Automatically update `progress` in the player store
- [x] On track end: check `repeatMode` — play next, replay, or stop accordingly
- [x] Keep Howler volume/mute in sync with the store values

---

## 🤖 AI Song Suggester — Bonus

**Files already scaffolded (no need to build from scratch):**
- `app/api/suggest-songs/route.ts` ✅ — API route that calls Anthropic
- `lib/hooks/useSongSuggestions.ts` ✅ — hook with loading/error/data state
- `components/suggestions/SongSuggestions.tsx` ✅ — complete UI widget

**What Iliya needs to do:**
- [x] Place `<SongSuggestions />` on the home page (`app/(main)/home/page.tsx`):
  ```tsx
  import { SongSuggestions } from '@/components/suggestions/SongSuggestions';
  // Add as a section on the home page
  <SongSuggestions />
  ```
- [x] In `lib/hooks/useSongSuggestions.ts`, read the play history from `usePlayerStore`
  and pass it to `recentlyPlayedIds` (currently always an empty array)
- [x] Verify the widget looks good on mobile
- [x] Expand the test file: `__tests__/hooks/useSongSuggestions.test.ts`
  (a starter test file already exists — fill it out further)

---

## 🧪 Tests — Iliya's Minimum: 4 tests

- [x] `__tests__/components/Player.test.tsx`
  - [x] Renders the current track title
  - [x] Play/pause button toggles `isPlaying` correctly
  - [x] Repeat mode cycles correctly: `none → all → one → none`
  - [x] Shuffle toggle flips the `isShuffled` flag
- [x] `__tests__/hooks/useSongSuggestions.test.ts` (starter already exists)
  - [x] Starts with empty suggestions and no error
  - [x] Sets `isLoading` to true while the request is in-flight
  - [x] Populates suggestions on a successful response
  - [x] Sets an error message on network failure

---

## 📁 Files Iliya Owns

```
components/player/
  ├── Player.tsx              ← main component (desktop bar)
  ├── MiniPlayer.tsx          ← mobile collapsed state
  ├── FullscreenPlayer.tsx    ← mobile expanded state
  ├── ProgressBar.tsx
  ├── VolumeControl.tsx
  ├── QueuePanel.tsx
  ├── LyricsPanel.tsx
  ├── RepeatButton.tsx
  ├── ShuffleButton.tsx
  └── PlayerPlaceholder.tsx   ← delete/replace when done
components/suggestions/
  └── SongSuggestions.tsx     ← already scaffolded, just wire up
lib/hooks/
  ├── useHowler.ts            ← create this
  └── useSongSuggestions.ts   ← already scaffolded
__tests__/components/
  └── Player.test.tsx
__tests__/hooks/
  └── useSongSuggestions.test.ts  ← already has starter tests
```

---

## 🚫 NOT Iliya's Responsibility

- Login / Register → **Foad**
- Notifications page → **Foad**
- PWA setup → **Foad**
- Support / Admin dashboard → **Foad**
- Home page layout → **Rayan**
- Sidebar / navigation → **Rayan**
- Library / search → **Rayan**
- Playlist pages → **Rayan**
- User / Artist profiles → **Rayan**

---

# ✅ Iliya — Task Checklist (Phase 2: Backend)

> Base project structure, models, and URL routing are already scaffolded in
> `soundwave-backend/apps/{music,playback}/`. Every `views.py`/`serializers.py`
> stub has a `# TODO(Iliya): ...` comment marking exactly what's left.

---

## 🎵 `apps/music` — Album/Track Catalog (spec §2.8, §2.10, §3.1, §3.4) — highest-value backend section

- [x] `AlbumViewSet`/`TrackViewSet.perform_create` / `perform_update` — restrict to the
      owning artist via `request.user.artist_profile` (an approved artist only, per `IsApprovedArtist`)
- [x] File upload handling for audio (`mp3`/`wav`/`flac`) and cover images — validate
      extension in `TrackSerializer.validate_audio_file`, store under `MEDIA_ROOT` (spec §3.4)
- [x] `TrackSerializer.get_stream_count` / `get_unique_listeners` — derive from `StreamEvent`;
      only expose `unique_listeners` to Gold subscribers (spec §2.9)
- [x] `TrackViewSet.stream` action — check the user's remaining daily stream limit
      (from `apps.billing.SubscriptionPlan`, spec §2.4 table) before logging a `StreamEvent`
- [x] Search by track title or artist name (`search_fields` already set) — verify it covers both
- [x] Sort by "Most listeners" and "Release date" — add a `listener_count` annotation for the former

## 🔊 `apps/playback` — Preferences Sync & AI Suggester Feed (spec §3.5, §5.2)

- [x] `MyPreferencesView` — confirm get-or-create works for a first-time user (volume, language, notification toggles)
- [x] `RecentlyPlayedView` — distinct track ids from `apps.music.StreamEvent`, most recent first
- [x] Wire `lib/hooks/useSongSuggestions.ts` on the frontend to call `GET /api/v1/playback/recently-played/`
      instead of always passing an empty array to `recentlyPlayedIds` (closes the loop from your Phase 1 TODO)

## 🧪 Tests — Iliya's minimum: contribute to the 15-test Phase 2 minimum

- [x] Only an approved artist can create/edit their own album/track (pending artist → 403, other artist's work → 403)
- [x] `/tracks/{id}/stream/` increments stream count and counts unique listeners once per user
- [x] A Free-tier user is blocked once their daily stream limit is hit
- [x] `recently-played/` returns distinct, most-recent-first track ids
- [x] Preferences persist across two separate requests ("devices")

## 🚫 NOT Iliya's Backend Responsibility

- `accounts`, `billing`, `support`, `notifications` apps → **Foad**
- `playlists`, `social` apps → **Rayan**
