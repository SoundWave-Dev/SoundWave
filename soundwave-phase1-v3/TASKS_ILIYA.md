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
- [ ] Cover image (56×56 px) — if `coverUrl` is null, show a gradient placeholder with the track title
- [ ] Track title (truncate with ellipsis if too long)
- [ ] Artist name — clickable, navigates to `/artist/[id]`
- [ ] Album name — clickable, navigates to album page (only if track has an album)
- [ ] Stream count + unique listeners (visible to Gold subscribers only)

**Center section — playback controls:**
- [ ] Play / Pause button (`usePlayerStore.resume` / `pause`)
- [ ] Next track button (`usePlayerStore.next`)
- [ ] Previous track button (`usePlayerStore.prev`) — if less than 3 seconds in, restart the current track instead
- [ ] Progress bar:
  - [ ] Display elapsed / total time (e.g. `1:23 / 3:45`)
  - [ ] Click or drag to seek
- [ ] Repeat button — cycles through 3 modes: `none → all → one`, with a different icon per mode
- [ ] Shuffle button — toggle on/off

**Right section — options:**
- [ ] Volume slider (0–100)
- [ ] Mute / unmute button
- [ ] Queue panel toggle button
- [ ] Lyrics panel toggle button (only shown if `track.lyrics !== null`)

---

### 📱 Mobile Player

- [ ] **Mini Player** (collapsed bar at the bottom):
  - [ ] Small cover + track title + play/pause button
  - [ ] Tapping the bar expands to the fullscreen player
- [ ] **Fullscreen Player** (slide-up overlay):
  - [ ] Large cover art
  - [ ] All desktop controls
  - [ ] Close button (slide down)
  - [ ] Swipe down gesture to close (optional)

---

### 📋 Queue Panel (slide-in panel)

- [ ] List of upcoming tracks in the queue
- [ ] Each row: track title + artist name + duration
- [ ] Currently playing track highlighted with `--color-primary`
- [ ] Click any track in the queue to play it immediately
- [ ] Close button for the panel

---

### 📝 Lyrics Panel

- [ ] If `track.lyrics !== null`: render lyrics with a readable font and good line spacing
- [ ] If no lyrics: empty state with message "No lyrics available for this track"
- [ ] Auto-scroll to the current line (optional — extra credit)

---

### 🔊 Audio Integration (Howler.js)

```ts
import { Howl } from 'howler';

// Create a new Howl instance whenever currentTrack changes
// Update progress in the store every 250ms using setInterval
// Clear the interval when the track changes or the component unmounts
```

- [ ] Create `useHowler` hook in `lib/hooks/useHowler.ts`
- [ ] Start playback when `isPlaying === true`
- [ ] Pause playback when `isPlaying === false`
- [ ] Automatically update `progress` in the player store
- [ ] On track end: check `repeatMode` — play next, replay, or stop accordingly
- [ ] Keep Howler volume/mute in sync with the store values

---

## 🤖 AI Song Suggester — Bonus

**Files already scaffolded (no need to build from scratch):**
- `app/api/suggest-songs/route.ts` ✅ — API route that calls Anthropic
- `lib/hooks/useSongSuggestions.ts` ✅ — hook with loading/error/data state
- `components/suggestions/SongSuggestions.tsx` ✅ — complete UI widget

**What Iliya needs to do:**
- [ ] Place `<SongSuggestions />` on the home page (`app/(main)/home/page.tsx`):
  ```tsx
  import { SongSuggestions } from '@/components/suggestions/SongSuggestions';
  // Add as a section on the home page
  <SongSuggestions />
  ```
- [ ] In `lib/hooks/useSongSuggestions.ts`, read the play history from `usePlayerStore`
  and pass it to `recentlyPlayedIds` (currently always an empty array)
- [ ] Verify the widget looks good on mobile
- [ ] Expand the test file: `__tests__/hooks/useSongSuggestions.test.ts`
  (a starter test file already exists — fill it out further)

---

## 🧪 Tests — Iliya's Minimum: 4 tests

- [ ] `__tests__/components/Player.test.tsx`
  - [ ] Renders the current track title
  - [ ] Play/pause button toggles `isPlaying` correctly
  - [ ] Repeat mode cycles correctly: `none → all → one → none`
  - [ ] Shuffle toggle flips the `isShuffled` flag
- [ ] `__tests__/hooks/useSongSuggestions.test.ts` (starter already exists)
  - [ ] Starts with empty suggestions and no error
  - [ ] Sets `isLoading` to true while the request is in-flight
  - [ ] Populates suggestions on a successful response
  - [ ] Sets an error message on network failure

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
