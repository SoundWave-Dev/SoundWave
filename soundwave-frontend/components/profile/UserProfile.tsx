'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { ROUTES } from '@/lib/constants';
import { getInitials, canUploadPhoto, getDailyStreamLimit, formatCount } from '@/lib/utils';
import { mockIsFollowingUser, mockToggleFollowUser, mockUpdateUserProfile } from '@/lib/mock/store';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

interface UserProfileProps {
  user: User;
  viewerId: string | null;
  isOwnProfile: boolean;
}

export function UserProfile({ user, viewerId, isOwnProfile }: UserProfileProps) {
  const router = useRouter();
  const { t } = useTranslation('userProfile');
  const TIER_BADGE: Record<User['subscription'], { label: string; bg: string; color: string }> = {
    free: { label: t('tierFree'), bg: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' },
    silver: { label: t('tierSilver'), bg: 'rgba(192,192,192,0.15)', color: 'var(--color-silver)' },
    gold: { label: t('tierGold'), bg: 'rgba(255,215,0,0.12)', color: 'var(--color-gold)' },
  };
  const updateAuthUser = useAuthStore((s) => s.updateUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followersCount);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!viewerId || isOwnProfile) return;
    setIsFollowing(mockIsFollowingUser(viewerId, user.id));
  }, [viewerId, user.id, isOwnProfile]);

  const handleToggleFollow = () => {
    if (!viewerId) return;
    const nowFollowing = mockToggleFollowUser(viewerId, user.id);
    setIsFollowing(nowFollowing);
    setFollowersCount((c) => c + (nowFollowing ? 1 : -1));
  };

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = mockUpdateUserProfile(user.id, { avatarUrl: dataUrl });
      if (updated) {
        setAvatarUrl(updated.avatarUrl);
        if (isOwnProfile) updateAuthUser({ avatarUrl: updated.avatarUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const badge = TIER_BADGE[user.subscription];
  const dailyLimit = getDailyStreamLimit(user.subscription);
  const canUpload = canUploadPhoto(user.subscription);

  return (
    <div>
      <div style={{
        background: 'linear-gradient(180deg, var(--color-primary-glow), transparent)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        flexWrap: 'wrap',
        border: '1px solid var(--color-border)',
      }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.displayName}
            style={{ width: 120, height: 120, borderRadius: 'var(--radius-full)', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }}
          />
        ) : (
          <div style={{
            width: 120,
            height: 120,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 'var(--text-3xl)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {getInitials(user.displayName)}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {user.displayName}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 2 }}>@{user.username}</p>

          <span style={{
            display: 'inline-block',
            marginTop: 'var(--space-3)',
            padding: '4px var(--space-3)',
            borderRadius: 'var(--radius-full)',
            background: badge.bg,
            color: badge.color,
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
          }}>
            {badge.label}
          </span>

          <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                {formatCount(followersCount)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t('followersLabel')}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                {formatCount(user.followingCount)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t('followingLabel')}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignSelf: 'flex-start' }}>
          {isOwnProfile ? (
            <Button variant="secondary" onClick={() => router.push(ROUTES.SETTINGS)}>
              {t('editProfile')}
            </Button>
          ) : (
            <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={handleToggleFollow}>
              {isFollowing ? t('following') : t('follow')}
            </Button>
          )}
        </div>
      </div>

      <div style={{
        marginTop: 'var(--space-6)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        <div style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            {t('dailyStreamLabel')}
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {user.dailyStreamsUsed}{dailyLimit !== null ? ` / ${dailyLimit}` : ''}
          </div>
          {dailyLimit === null && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', marginTop: 4 }}>{t('unlimited')}</div>
          )}
        </div>

        {isOwnProfile && (
          <div style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              {t('profilePhotoLabel')}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelected}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              disabled={!canUpload}
              title={canUpload ? undefined : t('uploadPhotoTooltip')}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: canUpload ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                cursor: canUpload ? 'pointer' : 'not-allowed',
              }}
            >
              {t('uploadPhoto')} {!canUpload && '🔒'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
