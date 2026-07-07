'use client';

import { useEffect, useState } from 'react';
import type { Artist, Album, Track, SubscriptionTier } from '@/types';
import { canViewStats, formatCount } from '@/lib/utils';
import { mockIsFollowingArtist, mockToggleFollowArtist } from '@/lib/mock/store';
import { Button } from '@/components/ui';
import AlbumCard from '@/components/home/AlbumCard';
import TrackListItem from '@/components/home/TrackListItem';

interface ArtistProfileProps {
  artist: Artist;
  albums: Album[];
  singles: Track[];
  viewerId: string | null;
  viewerSubscription: SubscriptionTier | null;
}

export function ArtistProfile({ artist, albums, singles, viewerId, viewerSubscription }: ArtistProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(artist.followersCount);

  useEffect(() => {
    if (!viewerId) return;
    setIsFollowing(mockIsFollowingArtist(viewerId, artist.id));
  }, [viewerId, artist.id]);

  const handleToggleFollow = () => {
    if (!viewerId) return;
    const nowFollowing = mockToggleFollowArtist(viewerId, artist.id);
    setIsFollowing(nowFollowing);
    setFollowersCount((c) => c + (nowFollowing ? 1 : -1));
  };

  const canSeeStats = viewerSubscription ? canViewStats(viewerSubscription) : false;

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
        {artist.avatarUrl ? (
          <img
            src={artist.avatarUrl}
            alt={artist.stageName}
            style={{ width: 120, height: 120, borderRadius: 'var(--radius-full)', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }}
          />
        ) : (
          <div style={{
            width: 120,
            height: 120,
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 'var(--text-3xl)',
            color: '#000',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {artist.stageName[0]}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {artist.stageName}
            </h1>
            {artist.isVerified && (
              <span title="هنرمند تایید شده" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                padding: '2px var(--space-2)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-info)',
                color: '#fff',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
              }}>
                ✓ تایید شده
              </span>
            )}
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)', maxWidth: 480 }}>
            {artist.bio}
          </p>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
              {formatCount(followersCount)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>دنبال‌کننده</div>
          </div>
        </div>

        <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={handleToggleFollow} style={{ alignSelf: 'flex-start' }}>
          {isFollowing ? 'دنبال‌شده' : 'دنبال کردن'}
        </Button>
      </div>

      {canSeeStats && (
        <div style={{
          marginTop: 'var(--space-6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          <div style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gold)', marginBottom: 'var(--space-2)' }}>
              🔒 مجموع استریم‌ها (ویژه طلایی)
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {formatCount(artist.totalStreams)}
            </div>
          </div>
          <div style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gold)', marginBottom: 'var(--space-2)' }}>
              🔒 شنوندگان یکتا (ویژه طلایی)
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {formatCount(artist.totalListeners)}
            </div>
          </div>
        </div>
      )}

      {albums.length > 0 && (
        <section style={{ marginTop: 'var(--space-8)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
            آلبوم‌ها
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {singles.length > 0 && (
        <section style={{ marginTop: 'var(--space-8)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
            تک‌آهنگ‌ها
          </h2>
          {singles.map((track) => (
            <TrackListItem key={track.id} track={track} queue={singles} />
          ))}
        </section>
      )}

      {albums.length === 0 && singles.length === 0 && (
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
          هنوز اثری منتشر نشده است.
        </div>
      )}
    </div>
  );
}
