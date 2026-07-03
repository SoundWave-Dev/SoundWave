'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { getInitials } from '@/lib/utils';

export default function GreetingHeader() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '6px',
          }}
        >
          سلام {user.displayName} 👋
        </h1>

        <p
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          به SoundWave خوش اومدی.
        </p>
      </div>

      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          {getInitials(user.displayName)}
        </div>
      )}
    </div>
  );
}
