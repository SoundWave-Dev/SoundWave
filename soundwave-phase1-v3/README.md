# 🎵 Soundwave — Web Programming Course Project

**Sharif University of Technology · Department of Computer Engineering · Spring 1404**
Instructor: Ali Abrishami

---

## 👥 Team

| Name | Responsibility |
|------|---------------|
| **Foad** | Auth, Notifications, Artist Panel, Dashboard, PWA |
| **Iliya** | Music Player, Song Suggester (AI) |
| **Rayan** | Home, Sidebar, Profiles, Library, Playlists, Settings |

---

## 🚀 Quick Start

```bash
npm install
npm run dev        # http://localhost:3000

npm test           # run all tests
npm run lint       # check code style
```

**Dev login credentials** (Phase 1 mock):

| Email | Password | Role |
|-------|----------|------|
| `ali@example.com` | `password123` | Listener (Free) |
| `sara@example.com` | `password123` | Listener (Gold) |
| `dariush@example.com` | `password123` | Artist |
| `admin@soundwave.ir` | `password123` | Admin |

---

## 🏗️ Project Structure

```
soundwave/
├── app/
│   ├── (auth)/        # Login, Register — Foad
│   ├── (main)/        # All authenticated pages (sidebar + player layout)
│   ├── (artist)/      # Artist management panel — Foad
│   ├── (dashboard)/   # Support & Admin panel — Foad
│   ├── api/           # Next.js API routes
│   └── offline/       # PWA offline fallback page — Foad
├── components/
│   ├── ui/            # Shared primitives (Button, Input, Modal...)
│   ├── layout/        # Sidebar, Topbar — Rayan
│   ├── player/        # Music player — Iliya
│   ├── suggestions/   # AI song suggester — Iliya
│   ├── pwa/           # PWA install prompt — Foad
│   ├── auth/          # Login/Register forms — Foad
│   ├── home/          # Home page sections — Rayan
│   ├── profile/       # User & Artist profiles — Rayan
│   ├── playlist/      # Playlist UI — Rayan
│   ├── library/       # Library/search — Rayan
│   ├── notifications/ # Notifications — Foad
│   └── dashboard/     # Support/Admin dashboard — Foad
├── lib/
│   ├── store/         # Zustand global state (auth, player)
│   ├── mock/          # Phase 1 localStorage data & helpers
│   ├── constants/     # Business rules, subscription limits, routes
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Pure helper functions
├── types/             # All shared TypeScript interfaces
├── styles/            # globals.css + design tokens
└── __tests__/         # All test files
```

---

## 🎨 Design System — READ BEFORE WRITING ANY CSS

> **⚠️ CRITICAL: Never hard-code color values anywhere in the codebase.**
> Always use the CSS variables defined in `styles/globals.css`.

### Color Palette

```css
--color-primary        /* #1DB954 — Brand green (change once here to retheme everything) */
--color-bg             /* #0D0D0D — Page background */
--color-surface-1      /* #181818 — Cards, sidebar */
--color-surface-2      /* #222222 — Hover states */
--color-surface-3      /* #2A2A2A — Inputs, elevated cards */
--color-text-primary   /* #FFFFFF */
--color-text-secondary /* #A7A7A7 */
--color-text-muted     /* #6A6A6A */
--color-gold           /* #FFD700 — Gold subscription badge */
--color-silver         /* #C0C0C0 — Silver subscription badge */
--color-error          /* #E9475A */
--color-primary-glow   /* rgba(29,185,84,0.15) — glowing highlight */
```

### Typography

```css
--font-sans:    'Inter'          /* all body text */
--font-display: 'Space Grotesk' /* headings, logo */
```

### Spacing Scale

Always use the spacing scale: `--space-1` (4px) through `--space-16` (64px).
Never write pixel values directly in style props.

### Correct Usage Example

```tsx
// ✅ CORRECT
<button style={{ background: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }}>
  Play
</button>

// ❌ WRONG — hard-coded, breaks theming
<button style={{ background: '#1DB954', borderRadius: '999px' }}>
  Play
</button>
```

---

## 📝 Coding Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `TrackCard.tsx` |
| Hooks | camelCase with `use` prefix | `usePlayerStore.ts` |
| Utils / Helpers | camelCase | `formatDuration.ts` |
| Pages | `page.tsx` (Next.js convention) | `app/(main)/home/page.tsx` |
| Tests | `ComponentName.test.tsx` | `Player.test.tsx` |

### Component Rules

```tsx
// ✅ Always define and export prop types
interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

// ✅ Named exports for components (default only for pages)
export function TrackCard({ track, onPlay }: TrackCardProps) { ... }

// ✅ Use const arrow functions for event handlers
const handleClick = () => { ... };
```

### State Management

| What | Where |
|------|-------|
| Global app state (auth, player) | Zustand stores in `lib/store/` |
| Server state (Phase 2) | React Query |
| Form state | `react-hook-form` + `zod` |
| Local UI state | `useState` inside the component |

### Git Branching

```
main            ← stable, always working — never commit directly
dev             ← integration branch — merge features here first
feature/foad-*  ← Foad's features
feature/iliya-* ← Iliya's features
feature/rayan-* ← Rayan's features
```

**Examples:**
- `feature/foad-auth-login`
- `feature/iliya-player-core`
- `feature/rayan-sidebar`

### Commit Message Format

```
feat(auth): add login form validation
fix(player): correct repeat mode cycling
style(sidebar): align nav icons
refactor(store): simplify auth slice
test(player): add shuffle mode test
```

---

## 🧪 Testing

Minimum requirement: **10 tests for Phase 1** (split roughly 4 / 4 / 4 across team members — see individual task files).

```bash
npm test                    # run all tests once
npm test -- --watch         # watch mode during development
npm test -- Player          # run only Player-related tests
```

Place test files in `__tests__/components/`, `__tests__/hooks/`, or `__tests__/utils/`.

---

## 📦 Key Dependencies

| Package | Purpose | Owner |
|---------|---------|-------|
| `next` 14 | Framework | All |
| `next-pwa` | PWA / service worker | Foad |
| `zustand` | Global state | All |
| `react-hook-form` + `zod` | Form validation | Foad |
| `howler` | Audio playback | Iliya |
| `lucide-react` | Icons | All |
| `date-fns` | Date/time formatting | All |
| `clsx` | Conditional class names | All |

---

## ❓ FAQ

**Q: How do I check if the current user can access a feature?**
Use the helper functions in `lib/utils/index.ts`:
```ts
import { canViewStats, hasReachedStreamLimit, canAccessEarlyContent } from '@/lib/utils';
if (canViewStats(user.subscription)) { /* show stats */ }
```

**Q: How do I read/write data in Phase 1 (before the backend exists)?**
Use `lib/mock/store.ts` — it wraps localStorage and mirrors what the real API will look like:
```ts
import { mockGetTracks, mockCreatePlaylist, mockGetNotifications } from '@/lib/mock/store';
```

**Q: Where are the TypeScript types?**
All shared types live in `types/index.ts`. Always import from `@/types`, never redefine shapes locally.

**Q: Where do I put new shared utility functions?**
Add them to `lib/utils/index.ts` with a JSDoc comment. Export everything from the index.

---

## 🌐 PWA (Progressive Web App) — Bonus Feature (Owner: Foad)

Users can install Soundwave on their phone or desktop like a native app.

**Files already in place:**
- `public/manifest.json` — app name, theme color, shortcuts
- `next.config.js` — `next-pwa` enabled (auto-disabled in dev)
- `components/pwa/PWAInstallPrompt.tsx` — "Add to Home Screen" banner
- `app/offline/page.tsx` — shown when the user has no internet

**What still needs to be done (Foad):** generate app icons and wire up the install prompt — see `TASKS_FOAD.md`.

**Testing PWA** (production build only):
```bash
npm run build && npm start
# Chrome DevTools → Application → Manifest
```

---

## 🤖 AI Song Suggester — Bonus Feature (Owner: Iliya)

Uses the Claude API to recommend tracks based on the user's mood and preferred genres.

**Files already in place:**
- `app/api/suggest-songs/route.ts` — API route calling Anthropic
- `lib/hooks/useSongSuggestions.ts` — hook managing loading/error/data state
- `components/suggestions/SongSuggestions.tsx` — complete UI widget

**What still needs to be done (Iliya):** place the component on the home page and wire up the play history — see `TASKS_ILIYA.md`.

**In Phase 2:** replace `MOCK_TRACKS` in the API route with a real database query.
