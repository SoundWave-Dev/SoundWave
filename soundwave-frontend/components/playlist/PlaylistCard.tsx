'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Playlist } from '@/types';
import { ROUTES } from '@/lib/constants';
import { Input } from '@/components/ui';

interface PlaylistCardProps {
  playlist: Playlist;
  onRename: (id: string, name: string) => void;
  onDelete: (playlist: Playlist) => void;
}

export function PlaylistCard({ playlist, onRename, onDelete }: PlaylistCardProps) {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(playlist.name);

  const commitRename = () => {
    setIsRenaming(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== playlist.name) onRename(playlist.id, trimmed);
    else setName(playlist.name);
  };

  return (
    <div
      className="sw-playlist-card"
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        transition: 'border-color var(--transition-fast), transform var(--transition-fast)',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isRenaming && router.push(`${ROUTES.PLAYLISTS}/${playlist.id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !isRenaming) router.push(`${ROUTES.PLAYLISTS}/${playlist.id}`); }}
        style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: 'var(--radius-md)',
          background: playlist.coverUrl
            ? `url(${playlist.coverUrl}) center/cover`
            : 'linear-gradient(135deg, var(--color-surface-3), var(--color-surface-2))',
          marginBottom: 'var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          cursor: 'pointer',
        }}
      >
        {!playlist.coverUrl && '🎵'}
      </div>

      {isRenaming ? (
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setName(playlist.name); setIsRenaming(false); } }}
        />
      ) : (
        <h3
          onClick={() => setIsRenaming(true)}
          title="برای تغییر نام کلیک کنید"
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            marginBottom: 4,
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'text',
          }}
        >
          {playlist.name}
        </h3>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
          {playlist.tracks.length} آهنگ
        </span>
        <button
          type="button"
          aria-label="حذف پلی‌لیست"
          onClick={() => onDelete(playlist)}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
        >
          🗑
        </button>
      </div>

      <style>{`.sw-playlist-card:hover { border-color: var(--color-primary); }`}</style>
    </div>
  );
}
