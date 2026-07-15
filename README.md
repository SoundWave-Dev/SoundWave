# 🎵 SoundWave

> A full-stack music streaming service — built as a course project at Sharif University of Technology.

**Course:** Web Programming · Spring 1404  
**Instructor:** Ali Abrishami  
**Team:** Foad · Iliya · Rayan

---

## 📦 Repository Structure

```
SoundWave/
├── soundwave-frontend/    ← Next.js 14 (React, TypeScript)
├── soundwave-backend/     ← Django + Django REST Framework (Phase 2)
└── docker-compose.yml     ← optional bonus: `docker compose up` runs both
```

---

## 👥 Team & Ownership

| Name | Phase 1 (Frontend) | Phase 2 (Backend) |
|------|-------------------|-------------------|
| **Foad** | Auth, Notifications, Artist Panel, Dashboard, PWA | `accounts`, `billing`, `support`, `notifications` |
| **Iliya** | Music Player, AI Song Suggester | `music`, `playback` |
| **Rayan** | Home, Sidebar, Profiles, Library, Playlists | `playlists`, `social` |

Backend app ownership mirrors each person's Phase 1 area — whoever built the frontend
page/component owns the Django app(s) it talks to. Detailed per-app checklists are in
each person's `TASKS_*.md` (Phase 2 section).

---

## 🚀 Getting Started

### Frontend

```bash
cd soundwave-frontend
npm install
npm run dev        # http://localhost:3000
npm test           # run tests
```

### Backend

```bash
cd soundwave-backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then point DB_* at a running Postgres instance
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

Base project structure, models, and URL routing already exist — see `apps/`
below. Views/serializers are stubbed with `TODO(<owner>)` comments for each
person to fill in.

### Full Stack with Docker *(optional bonus — see Docker section below)*

```bash
docker compose up
```

---

## 🗺️ Project Overview

SoundWave is a Spotify-like music streaming platform. Users can stream music, manage playlists, and follow artists. The system has four user roles with different access levels.

### User Roles

| Role | Description |
|------|-------------|
| **Listener** | Streams music, manages playlists, follows artists |
| **Artist** | Publishes singles and albums after account approval |
| **Support** | Reviews artist verification requests, handles tickets |
| **Admin** | Full access — manages pricing, payouts, and all settings |

### Subscription Tiers

| Feature | Free | Silver | Gold |
|---------|------|--------|------|
| Daily stream limit | 60 | Unlimited | Unlimited |
| Max playlists | 6 | 100 | Unlimited |
| Profile photo | ✗ | ✓ | ✓ |
| Download tracks | ✗ | ✓ | ✓ |
| Early access to new releases | ✗ | ✗ | ✓ |
| View artist stats | ✗ | ✗ | ✓ |

---

## 🖥️ Frontend (Phase 1)

**Stack:** Next.js 14 · TypeScript · Zustand · React Hook Form · Zod · Howler.js

### Pages & Components

| Page / Component | Path | Owner |
|-----------------|------|-------|
| Login / Register | `/login` | Foad |
| Home | `/home` | Rayan |
| Library / Search | `/library` | Rayan |
| Playlists | `/playlists` | Rayan |
| User Profile | `/profile/[username]` | Rayan |
| Artist Profile | `/artist/[id]` | Rayan |
| Settings | `/settings` | Rayan |
| Notifications | `/notifications` | Foad |
| Artist Management | `/manage` | Foad |
| Support / Admin Dashboard | `/support` | Foad |
| **Music Player** *(global layout component, not a page)* | `components/player/` | **Iliya** |
| **AI Song Suggester** *(component embedded on Home)* | `components/suggestions/` | **Iliya** |

> **Note — why Iliya has no standalone pages:** Iliya owns the two most complex components in the project. The Music Player is a persistent bar rendered in the app shell layout (visible on every page), and the Song Suggester is a widget embedded inside the Home page. Neither is a route of its own, but both are independently developed and tested.

### Bonus Features

- **PWA** — installable as a native-like app (Foad)
- **AI Song Suggester** — Claude-powered recommendations by mood & genre (Iliya)

### Design System

All colors, spacing, and typography are defined as CSS variables in `frontend/styles/globals.css`.  
**Never hard-code color values** — always use `var(--color-primary)` etc.

```css
--color-primary:   #1DB954   /* brand green  */
--color-bg:        #0D0D0D   /* page background */
--font-display:    'Space Grotesk'
--font-sans:       'Inter'
```

---

## ⚙️ Backend (Phase 2)

**Stack:** Django · Django REST Framework · PostgreSQL · Redis · Celery *(planned)*

### App Structure

`soundwave-backend/apps/` is split by domain, not by person, but ownership
tracks Phase 1 areas (see team table above):

| App | Models | Owner |
|-----|--------|-------|
| `accounts` | `User`, `ArtistProfile` | Foad |
| `billing` | `SubscriptionPlan`, `Subscription`, `PaymentTransaction`, `Payout` | Foad |
| `support` | `Ticket`, `TicketMessage` | Foad |
| `notifications` | `Notification` | Foad |
| `music` | `Album`, `Track`, `StreamEvent` | Iliya |
| `playback` | `UserPreference` (play history reuses `music.StreamEvent`) | Iliya |
| `playlists` | `Playlist`, `PlaylistTrack` | Rayan |
| `social` | `Follow` | Rayan |

Pricing and tier limits (daily stream cap, playlist cap, etc.) live in the
`SubscriptionPlan` table, editable from the admin dashboard — never hard-coded,
so the admin can change them without a deploy (per course spec §3.2).

### API Design

- REST endpoints under `/api/v1/<app>/...`, one router per app (see each app's `urls.py`)
- JWT authentication (`djangorestframework-simplejwt`)
- Role-based (`apps.accounts.permissions`) and subscription-based permission classes
- Aggregated reporting endpoints only — no raw data dumps to the frontend
- File upload handling for audio (`mp3`/`wav`/`flac`) and cover/avatar images via `MEDIA_ROOT`

### Payment Gateway

Integration with one of: Zarinpal · AqayePardakht · PayPing · SizPay
(see `apps/billing/gateways.py`). Subscription durations: 1 / 3 / 6 / 12 months.

---

## 🎨 Coding Conventions

### Git Branching

```
main              ← stable, always deployable
dev               ← integration branch
feature/foad-*    ← Foad's features
feature/iliya-*   ← Iliya's features
feature/rayan-*   ← Rayan's features
```

### Commit Format

```
feat(auth): add JWT login endpoint
fix(player): correct repeat mode cycling
style(sidebar): align nav icons
refactor(models): simplify subscription logic
test(api): add track CRUD tests
docs(readme): update setup instructions
```

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `TrackCard.tsx` |
| React hooks | camelCase + `use` | `usePlayerStore.ts` |
| Django views | PascalCase | `TrackViewSet` |
| Django models | PascalCase | `ArtistProfile` |
| Test files | `*.test.tsx` / `test_*.py` | `Player.test.tsx` |

---

## 🧪 Testing Requirements

| Phase | Minimum |
|-------|---------|
| Phase 1 (Frontend) | 10 tests |
| Phase 2 (Backend) | 15 tests |

```bash
# Frontend
cd soundwave-frontend && npm test

# Backend
cd soundwave-backend && python manage.py test
```

---

## 📋 Task Files

Detailed per-person checklists are in the root of the repo:

- [`TASKS_FOAD.md`](./TASKS_FOAD.md)
- [`TASKS_ILIYA.md`](./TASKS_ILIYA.md)
- [`TASKS_RAYAN.md`](./TASKS_RAYAN.md)

---

## 📄 Final Report

A PDF report is required at the end of Phase 2. It must include:

- Each member's contributions per phase
- Development rules and process (naming, branching, code style)
- Project structure and justification
- Backend model design and relationships
- Role of AI tools in development
- One AI-generated code sample from each phase
- Strengths and weaknesses of AI in frontend vs backend development

