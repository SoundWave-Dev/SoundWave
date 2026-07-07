'use client';

import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { mockGetUserByUsername } from '@/lib/mock/store';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { UserProfile } from '@/components/profile/UserProfile';

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const authViewer = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock user so the page is viewable
  // without logging in. Remove this fallback (go back to
  // `const viewer = authViewer` + the early return) before shipping/committing.
  const viewer = authViewer ?? MOCK_USERS[1];

  if (!viewer) return <h2>ابتدا وارد شوید.</h2>;

  const profileUser = mockGetUserByUsername(params.username) ?? (params.username === viewer.username ? viewer : null);

  if (!profileUser) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
        کاربری با این نام یافت نشد.
      </div>
    );
  }

  return (
    <UserProfile
      user={profileUser}
      viewerId={viewer.id}
      isOwnProfile={profileUser.id === viewer.id}
    />
  );
}
