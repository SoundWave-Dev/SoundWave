// ============================================================
// SOUNDWAVE — MUSIC PLAYER COMPONENT STUB
// Owner: Iliya
// ============================================================
//
// TODO (Iliya): Build the full player component.
//
// DESKTOP: Fixed bar at the bottom of the page (app layout footer)
//   Layout: [track info | controls | volume+options]
//
// MOBILE: Collapsed mini-player that expands to full-screen overlay
//
// REQUIRED FEATURES:
//   ✅ Progress bar (seek on click/drag)
//   ✅ Play / Pause / Next / Previous buttons
//   ✅ Volume slider + mute toggle
//   ✅ Repeat button (cycleRepeat → none → all → one)
//   ✅ Shuffle button (toggleShuffle)
//   ✅ Queue panel (slide-in list of upcoming tracks)
//   ✅ Cover image (fallback to gradient placeholder)
//   ✅ Track title, artist name (clickable → artist page)
//   ✅ Album name (clickable → album page)
//   ✅ Lyrics panel toggle (if track.lyrics !== null)
//   ✅ Stream count + unique listeners (gold subscription only)
//   ✅ Mini player on mobile that expands to fullscreen
//
// STATE: use usePlayerStore from lib/store/playerStore.ts
// AUDIO: use Howler.js (already in package.json)
//        import { Howl } from 'howler'
//
// SUGGESTED PACKAGES TO EVALUATE:
//   - react-range (slider)
//   - framer-motion (mini → fullscreen animation)
//
// TESTS: Write at least 3 tests in __tests__/components/Player.test.tsx
//   - renders track title
//   - play/pause toggles correctly
//   - repeat mode cycles correctly
// ============================================================

export default function PlayerPlaceholder() {
  return (
    <div style={{
      height: 'var(--player-height)',
      background: 'var(--color-surface-1)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-muted)',
      fontSize: 'var(--text-sm)',
    }}>
      🎵 Player — Iliya در حال پیاده‌سازی
    </div>
  );
}
