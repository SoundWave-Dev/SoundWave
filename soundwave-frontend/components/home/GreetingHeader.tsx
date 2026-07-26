'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

type GreetingKey = 'goodNight' | 'goodMorning' | 'goodAfternoon' | 'welcome';

function greetingKeyForHour(hour: number): GreetingKey {
  if (hour < 5) return 'goodNight';
  if (hour < 12) return 'goodMorning';
  if (hour < 18) return 'goodAfternoon';
  return 'goodNight';
}

export default function GreetingHeader() {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation('greetingHeader');
  const [greetingKey, setGreetingKey] = useState<GreetingKey>('welcome');

  useEffect(() => {
    setGreetingKey(greetingKeyForHour(new Date().getHours()));
  }, []);

  if (!user) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
          {t(greetingKey)}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}>
          {user.displayName} 👋
        </h1>
      </div>

      <Link href={ROUTES.PROFILE(user.username)}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'var(--text-xl)',
            }}
          >
            {getInitials(user.displayName)}
          </div>
        )}
      </Link>
    </div>
  );
}
