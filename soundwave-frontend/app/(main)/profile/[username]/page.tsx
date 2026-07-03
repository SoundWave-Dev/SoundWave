'use client';

import { useAuthStore } from '@/lib/store/authStore';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <h2>Please login.</h2>;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h1>👤 Profile</h1>

      <div
        style={{
          background: '#181818',
          padding: 20,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: '#333',
            display: 'grid',
            placeItems: 'center',
            fontSize: 30,
          }}
        >
          {user.displayName[0]}
        </div>

        <h2>{user.displayName}</h2>
        <p>@{user.username}</p>
        <p>Subscription: {user.subscription}</p>

        <p>Followers: {user.followersCount}</p>
        <p>Following: {user.followingCount}</p>
        <p>Daily Streams: {user.dailyStreamsUsed}</p>

        <div style={{ marginTop: 20 }}>
          <button>Follow</button>

          <button style={{ marginLeft: 10 }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
