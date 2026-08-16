# ✅ Rayan — Task Checklist (Phase 1)

> This file is maintained by Rayan. Check off each item as you complete it.

---

## 🧭 Sidebar Navigation (`components/layout/Sidebar.tsx`)

A placeholder file already exists — edit it directly.

**Desktop (≥769px):**
- [x] App logo / name at the top
- [x] Navigation links with icons from `lucide-react`:
  - [x] Home → `/home`
  - [x] Playlists → `/playlists`
  - [x] Library → `/library`
  - [x] Settings → `/settings`
- [x] Active link highlighted with `--color-primary`
- [x] Bottom section: user avatar + display name + subscription tier badge
- [x] Notification bell icon with an unread-count badge

**Mobile (<768px):**
- [x] Sidebar hidden
- [x] Replace with a bottom navigation bar **or** a hamburger button that opens a right-side drawer

---

## 🏠 Home Page (`app/(main)/home/page.tsx`)

A stub file already exists — build it out.

- [x] **Greeting header:** user avatar + display name
  - [x] If `avatarUrl` is null, show a placeholder using initials (`getInitials()` from `lib/utils`)
- [x] **Section: Recently played playlists** (horizontal scroll row)
  - [x] Cards from `mockGetPlaylists(userId)`
- [x] **Section: Latest released albums** (horizontal scroll row)
  - [x] Cards from `mockGetAlbums()`
- [x] **Section: Top tracks** (sorted by `streamCount` descending)
- [x] **Section: Early Access** (Gold subscribers only)
  - [x] Use `canAccessEarlyContent(user.subscription)` to check
  - [x] Do not render this section at all for Free / Silver users

---

## 👤 User Profile Page (`app/(main)/profile/[username]/page.tsx`)

- [x] Show: avatar, display name, system-assigned username, subscription tier
- [x] Subscription badge color: gold for Gold, silver/gray for Silver, plain for Free
- [x] Follower count + following count
- [x] Daily stream usage stats
- [x] Follow / Unfollow button
- [x] "Edit profile" button (only shown on the current user's own profile)
- [x] If user has a Free subscription: photo upload button is **disabled** with a tooltip explaining why

---

## 🎤 Artist Profile Page (`app/(main)/artist/[id]/page.tsx`)

- [x] Artist biography
- [x] "Verified Artist" badge if `artist.isVerified === true`
- [x] List of all albums and singles published by this artist
- [x] Follow / Unfollow button
- [x] Overall stats (Gold subscribers only): unique listener count + total streams
  - [x] Use `canViewStats(user.subscription)` to guard this

---

## ⚙️ Settings Page (`app/(main)/settings/page.tsx`)

- [x] Display current subscription tier with a summary of its benefits
- [x] "Upgrade subscription" button → navigates to `/payment` (disabled in Phase 1, implemented in Phase 2)
- [x] Notification preferences (toggle or checkbox per notification type)
- [x] System volume control
- [x] Language toggle (Persian / English)
- [x] "Delete account" button with a confirmation dialog

---

## 🎵 Playlist Pages (`app/(main)/playlists/page.tsx`)

- [x] List user's playlists from `mockGetPlaylists(userId)`
- [x] Show how many playlists the user has vs. their tier's limit
- [x] "Create playlist" button → modal with a name input field
  - [x] If the limit is reached: button is disabled with a tooltip explaining the limit
- [x] Delete playlist (with confirmation)
- [x] Rename playlist (inline edit)
- [x] Empty state when the user has no playlists
- [x] Playlist detail view: show the list of tracks inside it

---

## 📚 Library / Search Page (`app/(main)/library/page.tsx`)

- [x] **Search bar:** search by track title or artist name
- [x] **Sort dropdown:** "Most listeners" and "Release date"
- [x] **Album Card:**
  - [x] Cover, album title, artist name
  - [x] Click card → album detail page
  - [x] Click artist name → artist profile
- [x] **Track Card:**
  - [x] Cover, title, artist, album name (if applicable)
  - [x] Click card → play the track (`usePlayerStore.play`)
  - [x] Click artist name → artist profile
  - [x] Click album name → album page
- [x] **Add to playlist menu** on each track card:
  - [x] List user's playlists to choose from
  - [x] Disable option if the playlist limit is already reached (with tooltip)

---

## 🧪 Tests — Rayan's Minimum: 4 tests

- [x] `__tests__/components/Sidebar.test.tsx`
  - [x] All navigation links render
  - [x] The active link has a different style/color
- [x] `__tests__/components/PlaylistList.test.tsx`
  - [x] Empty state renders when no playlists exist
  - [x] "Create" button is disabled when the playlist limit is reached

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

- [x] `PlaylistViewSet.perform_create` — enforce the tier's `playlist_limit`
      (from `apps.billing.SubscriptionPlan`, free=6/silver=100/gold=∞) with a clear
      error message (frontend shows this as a disabled button + tooltip)
- [x] `add_track` / `remove_track` actions — manage `PlaylistTrack` rows, keep `position` ordering intact
- [x] Confirm a user can only see/edit/delete their **own** playlists (`IsOwner` permission already wired)

## 👥 `apps/social` — Follow/Unfollow & Profile Stats (spec §2.3, §2.4)

- [x] `FollowStatsView` — follower_count, following_count, is_following for a given user id
- [x] `FollowToggleView.post` — `get_or_create`, reject following yourself
- [x] `FollowToggleView.delete` — remove the `Follow` row
- [x] Wire the profile page's Follow/Unfollow button and follower/following counts to these two endpoints

## 🧪 Tests — Rayan's minimum: contribute to the 15-test Phase 2 minimum

- [x] Free-tier user blocked from creating a 7th playlist; Gold-tier user has no limit
- [x] A user cannot view/edit another user's playlist
- [x] Adding then removing a track updates `track_count` correctly
- [x] Follow then follow-stats reflects the new counts; unfollow reverses it
- [x] A user cannot follow themselves, and following twice doesn't create duplicate rows

## 🚫 NOT Rayan's Backend Responsibility

- `accounts`, `billing`, `support`, `notifications` apps → **Foad**
- `music`, `playback` apps → **Iliya**
