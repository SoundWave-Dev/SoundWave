'use client';

// ============================================================
// SOUNDWAVE — SONG SUGGESTION WIDGET
// AI-powered song recommendations using Claude.
//
// Usage: drop <SongSuggestions /> anywhere on the home page
// or library page (Rayan's responsibility to place it).
// ============================================================

import { useState } from 'react';
import { useSongSuggestions } from '@/lib/hooks/useSongSuggestions';
import { usePlayerStore } from '@/lib/store/playerStore';
import { useAuthStore } from '@/lib/store/authStore';
import { formatDuration } from '@/lib/utils';
import type { Track } from '@/types';

const MOOD_OPTIONS = [
  { value: 'energetic', label: '⚡ پرانرژی' },
  { value: 'calm',      label: '🌊 آرام' },
  { value: 'happy',     label: '😄 شاد' },
  { value: 'sad',       label: '🌧 غمگین' },
  { value: 'focus',     label: '🎯 تمرکز' },
];

const GENRE_OPTIONS = ['Pop', 'Traditional', 'Rock', 'Classical', 'Jazz', 'Electronic', 'Folk'];

interface SuggestionCardProps {
  track: Track;
  reason: string;
  onPlay: (track: Track) => void;
}

function SuggestionCard({ track, reason, onPlay }: SuggestionCardProps) {
  return (
    <div style={{
      background: 'var(--color-surface-2)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'center',
      border: '1px solid var(--color-border)',
      transition: 'border-color var(--transition-fast)',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    onClick={() => onPlay(track)}
    >
      {/* Cover */}
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        🎵
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {track.title}
        </div>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          marginTop: 2,
        }}>
          {track.artists.map((a) => a.stageName).join(', ')}
          {track.albumTitle && ` · ${track.albumTitle}`}
        </div>
        {/* AI reason */}
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-primary)',
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span>✨</span>
          <span>{reason}</span>
        </div>
      </div>

      {/* Duration + Play */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {formatDuration(track.duration)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(track); }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export function SongSuggestions() {
  const { user } = useAuthStore();
  const { play } = usePlayerStore();
  const { suggestions, isLoading, error, fetchSuggestions } = useSongSuggestions();

  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [hasRequested, setHasRequested] = useState(false);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleGetSuggestions = () => {
    setHasRequested(true);
    fetchSuggestions({
      recentlyPlayedIds: [],      // TODO: pull from player history store
      likedGenres: selectedGenres,
      mood: selectedMood || undefined,
    });
  };

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}>
          پیشنهاد هوشمند
        </h2>
        <span style={{
          padding: '2px var(--space-2)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-glow)',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          border: '1px solid var(--color-primary)',
        }}>
          AI ✨
        </span>
      </div>

      {/* Controls */}
      <div style={{
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        marginBottom: 'var(--space-5)',
      }}>
        {/* Mood selector */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-3)',
          }}>
            حال‌وهوا
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(selectedMood === m.value ? '' : m.value)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: selectedMood === m.value ? 'var(--color-primary)' : 'var(--color-border)',
                  background: selectedMood === m.value ? 'var(--color-primary-glow)' : 'transparent',
                  color: selectedMood === m.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre selector */}
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-3)',
          }}>
            ژانر مورد علاقه
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {GENRE_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: selectedGenres.includes(g) ? 'var(--color-primary)' : 'var(--color-border)',
                  background: selectedGenres.includes(g) ? 'var(--color-primary-glow)' : 'transparent',
                  color: selectedGenres.includes(g) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleGetSuggestions}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            background: isLoading ? 'var(--color-surface-3)' : 'var(--color-primary)',
            color: isLoading ? 'var(--color-text-muted)' : '#000',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          {isLoading ? (
            <>
              <span style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                border: '2px solid var(--color-text-muted)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              در حال تحلیل سلیقه شما...
            </>
          ) : (
            <>✨ پیشنهاد بده</>
          )}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(233,71,90,0.1)',
          border: '1px solid var(--color-error)',
          color: 'var(--color-error)',
          fontSize: 'var(--text-sm)',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {suggestions.map(({ track, reason }) => (
            <SuggestionCard
              key={track.id}
              track={track}
              reason={reason}
              onPlay={(t) => play(t, [t])}
            />
          ))}
        </div>
      )}

      {hasRequested && !isLoading && suggestions.length === 0 && !error && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}>
          پیشنهادی یافت نشد. ژانر یا حال‌وهوای دیگری امتحان کنید.
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
