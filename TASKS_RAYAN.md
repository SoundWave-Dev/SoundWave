# ✅ Rayan — Task Checklist (Phase 1)

> This file is maintained by Rayan. Check off each item as you complete it.

---

## 🧭 Sidebar Navigation (`components/layout/Sidebar.tsx`)

A placeholder file already exists — edit it directly.

**Desktop (≥769px):**
- [ ] App logo / name at the top
- [ ] Navigation links with icons from `lucide-react`:
  - [ ] Home → `/home`
  - [ ] Playlists → `/playlists`
  - [ ] Library → `/library`
  - [ ] Settings → `/settings`
- [ ] Active link highlighted with `--color-primary`
- [ ] Bottom section: user avatar + display name + subscription tier badge
- [ ] Notification bell icon with an unread-count badge

**Mobile (<768px):**
- [ ] Sidebar hidden
- [ ] Replace with a bottom navigation bar **or** a hamburger button that opens a right-side drawer

---

## 🏠 Home Page (`app/(main)/home/page.tsx`)

A stub file already exists — build it out.

- [ ] **Greeting header:** user avatar + display name
  - [ ] If `avatarUrl` is null, show a placeholder using initials (`getInitials()` from `lib/utils`)
- [ ] **Section: Recently played playlists** (horizontal scroll row)
  - [ ] Cards from `mockGetPlaylists(userId)`
- [ ] **Section: Latest released albums** (horizontal scroll row)
  - [ ] Cards from `mockGetAlbums()`
- [ ] **Section: Top tracks** (sorted by `streamCount` descending)
- [ ] **Section: Early Access** (Gold subscribers only)
  - [ ] Use `canAccessEarlyContent(user.subscription)` to check
  - [ ] Do not render this section at all for Free / Silver users

---

## 👤 User Profile Page (`app/(main)/profile/[username]/page.tsx`)

- [ ] Show: avatar, display name, system-assigned username, subscription tier
- [ ] Subscription badge color: gold for Gold, silver/gray for Silver, plain for Free
- [ ] Follower count + following count
- [ ] Daily stream usage stats
- [ ] Follow / Unfollow button
- [ ] "Edit profile" button (only shown on the current user's own profile)
- [ ] If user has a Free subscription: photo upload button is **disabled** with a tooltip explaining why

---

## 🎤 Artist Profile Page (`app/(main)/artist/[id]/page.tsx`)

- [ ] Artist biography
- [ ] "Verified Artist" badge if `artist.isVerified === true`
- [ ] List of all albums and singles published by this artist
- [ ] Follow / Unfollow button
- [ ] Overall stats (Gold subscribers only): unique listener count + total streams
  - [ ] Use `canViewStats(user.subscription)` to guard this

---

## ⚙️ Settings Page (`app/(main)/settings/page.tsx`)

- [ ] Display current subscription tier with a summary of its benefits
- [ ] "Upgrade subscription" button → navigates to `/payment` (disabled in Phase 1, implemented in Phase 2)
- [ ] Notification preferences (toggle or checkbox per notification type)
- [ ] System volume control
- [ ] Language toggle (Persian / English)
- [ ] "Delete account" button with a confirmation dialog

---

## 🎵 Playlist Pages (`app/(main)/playlists/page.tsx`)

- [ ] List user's playlists from `mockGetPlaylists(userId)`
- [ ] Show how many playlists the user has vs. their tier's limit
- [ ] "Create playlist" button → modal with a name input field
  - [ ] If the limit is reached: button is disabled with a tooltip explaining the limit
- [ ] Delete playlist (with confirmation)
- [ ] Rename playlist (inline edit)
- [ ] Empty state when the user has no playlists
- [ ] Playlist detail view: show the list of tracks inside it

---

## 📚 Library / Search Page (`app/(main)/library/page.tsx`)

- [ ] **Search bar:** search by track title or artist name
- [ ] **Sort dropdown:** "Most listeners" and "Release date"
- [ ] **Album Card:**
  - [ ] Cover, album title, artist name
  - [ ] Click card → album detail page
  - [ ] Click artist name → artist profile
- [ ] **Track Card:**
  - [ ] Cover, title, artist, album name (if applicable)
  - [ ] Click card → play the track (`usePlayerStore.play`)
  - [ ] Click artist name → artist profile
  - [ ] Click album name → album page
- [ ] **Add to playlist menu** on each track card:
  - [ ] List user's playlists to choose from
  - [ ] Disable option if the playlist limit is already reached (with tooltip)

---

## 🧪 Tests — Rayan's Minimum: 4 tests

- [ ] `__tests__/components/Sidebar.test.tsx`
  - [ ] All navigation links render
  - [ ] The active link has a different style/color
- [ ] `__tests__/components/PlaylistList.test.tsx`
  - [ ] Empty state renders when no playlists exist
  - [ ] "Create" button is disabled when the playlist limit is reached

---

## 📁 Files Rayan Owns

```
app/(main)/
  ├── home/page.tsx
  ├── profile/[username]/page.tsx
  ├── artist/[id]/page.tsx
  ├── settings/page.tsx
  ├── playlists/page.tsx
  └── library/page.tsx
components/layout/
  └── Sidebar.tsx
components/home/
  ├── GreetingHeader.tsx
  ├── SectionRow.tsx          ← reusable horizontal scroll section
  ├── AlbumCard.tsx
  └── TrackListItem.tsx
components/profile/
  ├── UserProfile.tsx
  └── ArtistProfile.tsx
components/playlist/
  ├── PlaylistList.tsx
  ├── PlaylistCard.tsx
  └── CreatePlaylistModal.tsx
components/library/
  ├── SearchBar.tsx
  ├── SortDropdown.tsx
  ├── AlbumCard.tsx
  ├── TrackCard.tsx
  └── AddToPlaylistMenu.tsx
__tests__/components/
  ├── Sidebar.test.tsx
  └── PlaylistList.test.tsx
```

---

## 🚫 NOT Rayan's Responsibility

- Login / Register forms → **Foad**
- Notifications page → **Foad**
- Support / Admin dashboard → **Foad**
- Artist management panel → **Foad**
- PWA setup → **Foad**
- Music player → **Iliya**
- AI song suggester → **Iliya**

---

# ✅ Rayan — Task Checklist (Phase 2: Backend)

> Base project structure, models, and URL routing are already scaffolded in
> `soundwave-backend/apps/{playlists,social}/`. Every `views.py`/`serializers.py`
> stub has a `# TODO(Rayan): ...` comment marking exactly what's left.

---

## 🎵 `apps/playlists` — Playlist CRUD & Limits (spec §2.7, §3.2)

- [ ] `PlaylistViewSet.perform_create` — enforce the tier's `playlist_limit`
      (from `apps.billing.SubscriptionPlan`, free=6/silver=100/gold=∞) with a clear
      error message (frontend shows this as a disabled button + tooltip)
- [ ] `add_track` / `remove_track` actions — manage `PlaylistTrack` rows, keep `position` ordering intact
- [ ] Confirm a user can only see/edit/delete their **own** playlists (`IsOwner` permission already wired)

## 👥 `apps/social` — Follow/Unfollow & Profile Stats (spec §2.3, §2.4)

- [ ] `FollowStatsView` — follower_count, following_count, is_following for a given user id
- [ ] `FollowToggleView.post` — `get_or_create`, reject following yourself
- [ ] `FollowToggleView.delete` — remove the `Follow` row
- [ ] Wire the profile page's Follow/Unfollow button and follower/following counts to these two endpoints

## 🧪 Tests — Rayan's minimum: contribute to the 15-test Phase 2 minimum

- [ ] Free-tier user blocked from creating a 7th playlist; Gold-tier user has no limit
- [ ] A user cannot view/edit another user's playlist
- [ ] Adding then removing a track updates `track_count` correctly
- [ ] Follow then follow-stats reflects the new counts; unfollow reverses it
- [ ] A user cannot follow themselves, and following twice doesn't create duplicate rows

## 🚫 NOT Rayan's Backend Responsibility

- `accounts`, `billing`, `support`, `notifications` apps → **Foad**
- `music`, `playback` apps → **Iliya**
