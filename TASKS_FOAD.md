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
