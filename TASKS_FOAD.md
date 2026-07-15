# ✅ Foad — Task Checklist (Phase 1)

> This file is maintained by Foad. Check off each item as you complete it.

---

## 🔐 Auth Pages (`app/(auth)/`)

### Login Page (`app/(auth)/login/page.tsx`)

- [ ] Login form with two fields: **email** and **password**
- [ ] Validation using `zod` + `react-hook-form`:
  - Email must be a valid email address
  - Password minimum 8 characters
- [ ] Show inline validation errors below each field
- [ ] Submit button disabled while loading
- [ ] On successful login, redirect based on role:
  - `listener` / `artist` → `/home`
  - `support` / `admin` → `/support`
- [ ] "Forgot password" link → separate page/modal with email input
- [ ] "Register" link that switches to the registration tab
- [ ] Handle wrong credentials gracefully (clear error message to user)

### Register Page (same page, separate tab)

- [ ] **Listener tab:**
  - [ ] Display name (`displayName`)
  - [ ] Email
  - [ ] Password + confirm password (must match)
  - [ ] Date of birth
  - [ ] Gender (dropdown: male / female / other / prefer not to say)
  - [ ] Privacy policy checkbox — clicking "privacy policy" text opens a modal with the full text
- [ ] **Artist tab:**
  - [ ] Email + password
  - [ ] Stage name (`stageName`)
  - [ ] Portfolio upload (Phase 1: UI only, no real upload)
  - [ ] After submission: show "Your request is pending review" message
- [ ] Full `zod` validation on all fields

---

## 🔔 Notifications Page (`app/(main)/notifications/page.tsx`)

- [ ] Render list of notifications from `mockGetNotifications()`
- [ ] Unread notifications visually distinct (e.g. colored border or faint background tint)
- [ ] "Mark as read" button on each notification card
- [ ] "Delete" button on each notification card
- [ ] "Mark all as read" button at the top of the panel
- [ ] Empty state when there are no notifications
- [ ] Clickable notifications (those with `actionUrl`) navigate to the relevant page
- [ ] Show relative timestamps using `timeAgo()` from `lib/utils`

---

## 🎨 Artist Management Panel (`app/(artist)/manage/page.tsx`)

> Only visible to users with `role === 'artist'` AND `status === 'approved'`

- [ ] List of the artist's published works
- [ ] "Upload new track" button → modal/form with fields:
  - [ ] Track title
  - [ ] Audio file (MP3 / WAV / FLAC) — Phase 1: UI only, no actual upload
  - [ ] Cover image — Phase 1: UI only
  - [ ] Lyrics (optional textarea)
  - [ ] Genre
  - [ ] Release year
  - [ ] Type: "Single" or "Album"
  - [ ] Collaborating artists (optional)
- [ ] Edit an existing published work
- [ ] Delete a work (with confirmation dialog)
- [ ] Per-work stats: listener count, stream count, estimated earnings

---

## 🛡️ Support / Admin Dashboard (`app/(dashboard)/support/`)

> Only visible to users with `role === 'support'` or `role === 'admin'`

### Tab 1 — Artist Verification Requests

- [ ] Table with columns: stage name, email, registration date, status
- [ ] "View portfolio" button on each row
- [ ] "Approve" button → sets artist status to `approved`, sends notification
- [ ] "Reject" button → modal with a "reason for rejection" text field

### Tab 2 — Support Tickets

- [ ] Table with columns: ticket ID, username, subject, date, status
- [ ] Clicking a ticket opens a chatbox-style page
- [ ] Support agent can type and send a reply

### Tab 3 — Accounting (admin only)

- [ ] Monthly payout table for artists
- [ ] Columns: name, unique listeners, total streams, payout amount, payment status
- [ ] "Confirm settlement" button (admin only) — toggles status to "Paid"

### Tab 4 — Subscription Management (admin only)

- [ ] Form with two number inputs to update Silver and Gold subscription prices
- [ ] Pie chart showing user distribution across Free / Silver / Gold tiers
  (use plain SVG or a lightweight chart library — no heavy deps)
- [ ] Revenue summary cards for the current month

---

## 🌐 PWA (Progressive Web App) — Bonus

- [ ] Generate app icons and place them in `public/icons/`:
  - Sizes needed: 72, 96, 128, 144, 152, 192, 384, 512 px
  - Use [realfavicongenerator.net](https://realfavicongenerator.net) to generate all sizes at once
- [ ] Review `public/manifest.json` (already created — just needs the real icons)
- [ ] Add `<PWAInstallPrompt />` to `app/(main)/layout.tsx`:
  ```tsx
  import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
  // Place just before the closing </div> of app-shell:
  <PWAInstallPrompt />
  ```
- [ ] Verify in production: `npm run build && npm start` → Chrome DevTools → Application → Manifest
- [ ] Confirm the offline page (`/offline`) renders correctly when network is unavailable

**Files already scaffolded (just needs icons + wiring):**
- `public/manifest.json` ✅
- `next.config.js` (next-pwa configured) ✅
- `components/pwa/PWAInstallPrompt.tsx` ✅
- `app/offline/page.tsx` ✅

---

## 🧪 Tests — Foad's Minimum: 4 tests

- [ ] `__tests__/components/LoginForm.test.tsx`
  - [ ] Email and password fields render
  - [ ] Validation error appears when form is submitted empty
- [ ] `__tests__/components/Notifications.test.tsx`
  - [ ] Notification list renders
  - [ ] After clicking "mark as read", the notification updates

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

- [ ] `ListenerRegisterSerializer.validate()` — confirm_password match + privacy policy accepted
- [ ] `ListenerRegisterSerializer.create()` — generate system-assigned `username`, `role=listener`
- [ ] `ArtistRegisterSerializer.create()` — `User(role=artist)` + `ArtistProfile(status=pending)` in one transaction
- [ ] Embed `role` into the JWT claims (custom `TokenObtainPairSerializer`) so the frontend
      can redirect listener/artist → `/home` vs support/admin → `/support` without an extra request
- [ ] Forgot-password request/confirm — always return 200 regardless of whether the email exists
- [ ] `MeView` — add `subscription_tier`, `follower_count`, `following_count`, `daily_stream_count`
      as read-only fields once `apps.billing`/`apps.social`/`apps.music` are wired up

## 💳 `apps/billing` — Subscriptions, Pricing, Payments, Payouts (spec §2.11.2, §2.11.3, §3.2, §3.6)

- [ ] Admin pricing panel (`SubscriptionPlanPriceUpdateView`) — update Silver/Gold price, no code change needed
- [ ] `SubscribeView` — create `PaymentTransaction(status=pending)`, redirect to gateway
- [ ] Pick **one** gateway in `apps/billing/gateways.py` (ZarinPal / AqayePardakht / PayPing / SizPay — sandbox docs in spec §3.6) and implement `request_payment()` + `verify_payment()`
- [ ] `PaymentCallbackView` — verify payment, activate/extend `Subscription` (respect 1/3/6/12-month durations)
- [ ] `ConfirmSettlementView` — admin-only, flips a `Payout` to `Paid`
- [ ] Monthly payout calculation (management command or Celery task) — `unique_listeners`/`total_streams` → `amount`, run monthly not on-request
- [ ] `RevenueSummaryView` / `SubscriptionDistributionView` — aggregated queries only, never raw rows (spec §3.7)

## 🎫 `apps/support` — Tickets & Verification Review (spec §2.11.1)

- [ ] `TicketViewSet.messages` — list/create `TicketMessage` for the chatbox UI
- [ ] `ArtistVerificationViewSet.approve` — set `approved`, notify the artist
- [ ] `ArtistVerificationViewSet.reject` — require `reason`, store it, notify the artist

## 🔔 `apps/notifications`

- [ ] `mark_read` / `mark_all_read` actions
- [ ] Emit a `Notification` from the relevant place in `billing`/`support` (verification result, payout settled, new ticket, new artist request)

## 🧪 Tests — Foad's minimum: contribute to the 15-test Phase 2 minimum

- [ ] Listener/artist registration + login (see `apps/accounts/tests.py` TODOs)
- [ ] Admin price update is admin-only
- [ ] Payment callback activates a subscription
- [ ] Ticket visibility scoping (own tickets vs. support sees all)
- [ ] Approve/reject artist verification

## 🚫 NOT Foad's Backend Responsibility

- `music`, `playback` apps → **Iliya**
- `playlists`, `social` apps → **Rayan**
