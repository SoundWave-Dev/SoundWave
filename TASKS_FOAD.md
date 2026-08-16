# ✅ Foad — Task Checklist (Phase 1)

> This file is maintained by Foad. Check off each item as you complete it.

---

## 🔐 Auth Pages (`app/(auth)/`)

### Login Page (`app/(auth)/login/page.tsx`)

- [x] Login form with two fields: **email** and **password**
- [x] Validation using `zod` + `react-hook-form`:
  - Email must be a valid email address
  - Password minimum 8 characters
- [x] Show inline validation errors below each field
- [x] Submit button disabled while loading
- [x] On successful login, redirect based on role:
  - `listener` / `artist` → `/home`
  - `support` / `admin` → `/support`
- [x] "Forgot password" link → separate page/modal with email input
- [x] "Register" link that switches to the registration tab
- [x] Handle wrong credentials gracefully (clear error message to user)

### Register Page (same page, separate tab)

- [x] **Listener tab:**
  - [x] Display name (`displayName`)
  - [x] Email
  - [x] Password + confirm password (must match)
  - [x] Date of birth
  - [x] Gender (dropdown: male / female / other / prefer not to say)
  - [x] Privacy policy checkbox — clicking "privacy policy" text opens a modal with the full text
- [x] **Artist tab:**
  - [x] Email + password
  - [x] Stage name (`stageName`)
  - [x] Portfolio upload (Phase 1: UI only, no real upload)
  - [x] After submission: show "Your request is pending review" message
- [x] Full `zod` validation on all fields

---

## 🔔 Notifications Page (`app/(main)/notifications/page.tsx`)

- [x] Render list of notifications from `mockGetNotifications()`
- [x] Unread notifications visually distinct (e.g. colored border or faint background tint)
- [x] "Mark as read" button on each notification card
- [x] "Delete" button on each notification card
- [x] "Mark all as read" button at the top of the panel
- [x] Empty state when there are no notifications
- [x] Clickable notifications (those with `actionUrl`) navigate to the relevant page
- [x] Show relative timestamps using `timeAgo()` from `lib/utils`

---

## 🎨 Artist Management Panel (`app/(artist)/manage/page.tsx`)

> Only visible to users with `role === 'artist'` AND `status === 'approved'`

- [x] List of the artist's published works
- [x] "Upload new track" button → modal/form with fields:
  - [x] Track title
  - [x] Audio file (MP3 / WAV / FLAC) — Phase 1: UI only, no actual upload
  - [x] Cover image — Phase 1: UI only
  - [x] Lyrics (optional textarea)
  - [x] Genre
  - [x] Release year
  - [x] Type: "Single" or "Album"
  - [x] Collaborating artists (optional)
- [x] Edit an existing published work
- [x] Delete a work (with confirmation dialog)
- [x] Per-work stats: listener count, stream count, estimated earnings

---

## 🛡️ Support / Admin Dashboard (`app/(dashboard)/support/`)

> Only visible to users with `role === 'support'` or `role === 'admin'`

### Tab 1 — Artist Verification Requests

- [x] Table with columns: stage name, email, registration date, status
- [x] "View portfolio" button on each row
- [x] "Approve" button → sets artist status to `approved`, sends notification
- [x] "Reject" button → modal with a "reason for rejection" text field

### Tab 2 — Support Tickets

- [x] Table with columns: ticket ID, username, subject, date, status
- [x] Clicking a ticket opens a chatbox-style page
- [x] Support agent can type and send a reply

### Tab 3 — Accounting (admin only)

- [x] Monthly payout table for artists
- [x] Columns: name, unique listeners, total streams, payout amount, payment status
- [x] "Confirm settlement" button (admin only) — toggles status to "Paid"

### Tab 4 — Subscription Management (admin only)

- [x] Form with two number inputs to update Silver and Gold subscription prices
- [x] Pie chart showing user distribution across Free / Silver / Gold tiers
  (use plain SVG or a lightweight chart library — no heavy deps)
- [x] Revenue summary cards for the current month

---

## 🌐 PWA (Progressive Web App) — Bonus

- [x] Generate app icons and place them in `public/icons/`:
  - Sizes needed: 72, 96, 128, 144, 152, 192, 384, 512 px
  - Use [realfavicongenerator.net](https://realfavicongenerator.net) to generate all sizes at once
- [x] Review `public/manifest.json` (already created — just needs the real icons)
- [x] Add `<PWAInstallPrompt />` to `app/(main)/layout.tsx`:
  ```tsx
  import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
  // Place just before the closing </div> of app-shell:
  <PWAInstallPrompt />
  ```
- [x] Verify in production: `npm run build && npm start` → Chrome DevTools → Application → Manifest
- [x] Confirm the offline page (`/offline`) renders correctly when network is unavailable

**Files already scaffolded (just needs icons + wiring):**
- `public/manifest.json` ✅
- `next.config.js` (next-pwa configured) ✅
- `components/pwa/PWAInstallPrompt.tsx` ✅
- `app/offline/page.tsx` ✅

---

## 🧪 Tests — Foad's Minimum: 4 tests

- [x] `__tests__/components/LoginForm.test.tsx`
  - [x] Email and password fields render
  - [x] Validation error appears when form is submitted empty
- [x] `__tests__/components/Notifications.test.tsx`
  - [x] Notification list renders
  - [x] After clicking "mark as read", the notification updates

---

## 📁 Files Foad Owns

```
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
app/(main)/notifications/page.tsx
app/(artist)/manage/page.tsx
app/(dashboard)/support/
  ├── page.tsx
  ├── tickets/
  └── artists/
app/offline/page.tsx
components/auth/
  ├── LoginForm.tsx
  ├── RegisterListenerForm.tsx
  └── RegisterArtistForm.tsx
components/notifications/
  ├── NotificationList.tsx
  └── NotificationCard.tsx
components/dashboard/
  ├── ArtistApprovalTable.tsx
  ├── TicketList.tsx
  ├── TicketChat.tsx
  ├── PayoutTable.tsx
  └── PriceControlPanel.tsx
components/pwa/
  └── PWAInstallPrompt.tsx
public/
  ├── manifest.json
  └── icons/   ← generate and place icons here
```

---

## 🚫 NOT Foad's Responsibility

- Music player → **Iliya**
- AI song suggester → **Iliya**
- Home page sections → **Rayan**
- Sidebar navigation → **Rayan**
- Library / search → **Rayan**
- Playlist pages → **Rayan**
- User / Artist profile pages → **Rayan**

---

# ✅ Foad — Task Checklist (Phase 2: Backend)

> Base project structure, models, and URL routing are already scaffolded in
> `soundwave-backend/apps/{accounts,billing,support,notifications}/`. Every
> `views.py`/`serializers.py` stub has a `# TODO(Foad): ...` comment marking
> exactly what's left. Check off each item as you complete it.

---

## 🔐 `apps/accounts` — Auth & Artist Verification (spec §2.1, §3.1)

- [x] `ListenerRegisterSerializer.validate()` — confirm_password match + privacy policy accepted
- [x] `ListenerRegisterSerializer.create()` — generate system-assigned `username`, `role=listener`
- [x] `ArtistRegisterSerializer.create()` — `User(role=artist)` + `ArtistProfile(status=pending)` in one transaction
- [x] Embed `role` into the JWT claims (custom `TokenObtainPairSerializer`) so the frontend
      can redirect listener/artist → `/home` vs support/admin → `/support` without an extra request
- [x] Forgot-password request/confirm — always return 200 regardless of whether the email exists
- [x] `MeView` — add `subscription_tier`, `follower_count`, `following_count`, `daily_stream_count`
      as read-only fields once `apps.billing`/`apps.social`/`apps.music` are wired up

## 💳 `apps/billing` — Subscriptions, Pricing, Payments, Payouts (spec §2.11.2, §2.11.3, §3.2, §3.6)

- [x] Admin pricing panel (`SubscriptionPlanPriceUpdateView`) — update Silver/Gold price, no code change needed
- [x] `SubscribeView` — create `PaymentTransaction(status=pending)`, redirect to gateway
- [x] Pick **one** gateway in `apps/billing/gateways.py` (ZarinPal / AqayePardakht / PayPing / SizPay — sandbox docs in spec §3.6) and implement `request_payment()` + `verify_payment()` — went with ZarinPal
- [x] `PaymentCallbackView` — verify payment, activate/extend `Subscription` (respect 1/3/6/12-month durations)
- [x] `ConfirmSettlementView` — admin-only, flips a `Payout` to `Paid`
- [x] Monthly payout calculation (management command or Celery task) — `unique_listeners`/`total_streams` → `amount`, run monthly not on-request — `manage.py calculate_payouts`
- [x] `RevenueSummaryView` / `SubscriptionDistributionView` — aggregated queries only, never raw rows (spec §3.7)

## 🎫 `apps/support` — Tickets & Verification Review (spec §2.11.1)

- [x] `TicketViewSet.messages` — list/create `TicketMessage` for the chatbox UI
- [x] `ArtistVerificationViewSet.approve` — set `approved`, notify the artist
- [x] `ArtistVerificationViewSet.reject` — require `reason`, store it, notify the artist

## 🔔 `apps/notifications`

- [x] `mark_read` / `mark_all_read` actions
- [x] Emit a `Notification` from the relevant place in `billing`/`support` (verification result, payout settled, new ticket, new artist request)

## 🧪 Tests — Foad's minimum: contribute to the 15-test Phase 2 minimum

- [x] Listener/artist registration + login (see `apps/accounts/tests.py` TODOs)
- [x] Admin price update is admin-only
- [x] Payment callback activates a subscription
- [x] Ticket visibility scoping (own tickets vs. support sees all)
- [x] Approve/reject artist verification

## 🚫 NOT Foad's Backend Responsibility

- `music`, `playback` apps → **Iliya**
- `playlists`, `social` apps → **Rayan**
