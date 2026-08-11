'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getUserByUsername } from '@/lib/api/auth';
import { UserProfile } from '@/components/profile/UserProfile';
import { useTranslation } from '@/lib/i18n';
import type { User } from '@/types';

export default function ProfilePage() {
  const { t } = useTranslation('profilePage');
  const params = useParams<{ username: string }>();
  const viewer = useAuthStore((s) => s.user);
  const [profileUser, setProfileUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (!viewer) return;
    if (params.username === viewer.username) {
      setProfileUser(viewer);
    } else {
      getUserByUsername(params.username).then(setProfileUser);
    }
  }, [params.username, viewer]);

  if (!viewer) return <h2>{t('loginFirst')}</h2>;

  if (profileUser === undefined) {
    return null;
  }

  if (!profileUser) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
        {t('userNotFound')}
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
