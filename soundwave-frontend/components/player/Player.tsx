'use client';

// ============================================================
// SOUNDWAVE — MUSIC PLAYER
// Desktop: fixed bottom bar. Mobile: mini player → fullscreen overlay.
// Owner: Iliya
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/lib/store/playerStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useHowler } from '@/lib/hooks/useHowler';
import { ROUTES } from '@/lib/constants';
import { canViewStats, formatCount } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { RepeatButton } from './RepeatButton';
import { ShuffleButton } from './ShuffleButton';
import { QueuePanel } from './QueuePanel';
import { LyricsPanel } from './LyricsPanel';
import { MiniPlayer } from './MiniPlayer';
import { FullscreenPlayer } from './FullscreenPlayer';

export function Player() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffled = usePlayerStore((s) => s.isShuffled);

  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  const { seekTo } = useHowler();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => (isPlaying ? pause() : resume());
  const closePanels = () => { setIsQueueOpen(false); setIsLyricsOpen(false); };

  if (!currentTrack) {
    return (
      <div style={{
        height: 'var(--player-height)',
        background: 'var(--color-surface-1)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
      }}>
        هیچ آهنگی در حال پخش نیست
      </div>
    );
  }

  const canSeeStats = canViewStats(user?.subscription ?? 'free');

  return (
    <>
      {/* Desktop bar */}
      <div className="player-desktop" style={{
        height: 'var(--player-height)',
        background: 'var(--color-surface-1)',
        borderTop: '1px solid var(--color-border)',
        alignItems: 'center',
        padding: '0 var(--space-6)',
        gap: 'var(--space-6)',
      }}>
        {/* Left — track info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: 280, minWidth: 0 }}>
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt=""
              style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: '#000',
              textAlign: 'center',
              padding: 4,
              flexShrink: 0,
            }}>
              {currentTrack.title}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {currentTrack.title}
            </div>

            <div style={{ display: 'flex', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentTrack.artists.map((artist, i) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => router.push(ROUTES.ARTIST(artist.id))}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}
                >
                  {artist.stageName}{i < currentTrack.artists.length - 1 ? ',' : ''}
                </button>
              ))}
              {currentTrack.albumId && currentTrack.albumTitle && (
                <>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.ALBUM(currentTrack.albumId as string))}
                    style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {currentTrack.albumTitle}
                  </button>
                </>
              )}
            </div>

            {canSeeStats && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold)', marginTop: 2 }}>
                {formatCount(currentTrack.streamCount)} استریم · {formatCount(currentTrack.uniqueListeners)} شنونده یکتا
              </div>
            )}
          </div>
        </div>

        {/* Center — playback controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <ShuffleButton isShuffled={isShuffled} onClick={toggleShuffle} />
            <button
              type="button"
              aria-label="آهنگ قبلی"
              onClick={prev}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)', cursor: 'pointer' }}
            >
              ⏮
            </button>
            <button
              type="button"
              aria-label={isPlaying ? 'توقف' : 'پخش'}
              onClick={togglePlay}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: '#000',
                border: 'none',
                fontSize: 'var(--text-lg)',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              aria-label="آهنگ بعدی"
              onClick={next}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)', cursor: 'pointer' }}
            >
              ⏭
            </button>
            <RepeatButton repeatMode={repeatMode} onClick={cycleRepeat} />
          </div>

          <ProgressBar progress={progress} duration={currentTrack.duration} onSeek={seekTo} />
        </div>

        {/* Right — options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', width: 280, justifyContent: 'flex-end' }}>
          <VolumeControl volume={volume} isMuted={isMuted} onVolumeChange={setVolume} onToggleMute={toggleMute} />
          <button
            type="button"
            aria-label="باز کردن صف پخش"
            aria-pressed={isQueueOpen}
            onClick={() => { setIsQueueOpen((v) => !v); setIsLyricsOpen(false); }}
            style={{ background: 'transparent', border: 'none', color: isQueueOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}
          >
            📋
          </button>
          {currentTrack.lyrics !== null && (
            <button
              type="button"
              aria-label="باز کردن متن آهنگ"
              aria-pressed={isLyricsOpen}
              onClick={() => { setIsLyricsOpen((v) => !v); setIsQueueOpen(false); }}
              style={{ background: 'transparent', border: 'none', color: isLyricsOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}
            >
              📝
            </button>
          )}
        </div>
      </div>

      {/* Mobile mini player */}
      <div className="player-mobile" style={{ height: 'var(--player-height)', background: 'var(--color-surface-1)', borderTop: '1px solid var(--color-border)' }}>
        <MiniPlayer track={currentTrack} isPlaying={isPlaying} onTogglePlay={togglePlay} onExpand={() => setIsFullscreen(true)} />
      </div>

      <FullscreenPlayer
        isOpen={isFullscreen}
        track={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffled={isShuffled}
        onClose={() => setIsFullscreen(false)}
        onTogglePlay={togglePlay}
        onNext={next}
        onPrev={prev}
        onSeek={seekTo}
        onVolumeChange={setVolume}
        onToggleMute={toggleMute}
        onToggleRepeat={cycleRepeat}
        onToggleShuffle={toggleShuffle}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenLyrics={() => setIsLyricsOpen(true)}
      />

      <QueuePanel
        isOpen={isQueueOpen}
        onClose={closePanels}
        queue={queue}
        currentTrackId={currentTrack.id}
        onPlayTrack={(track) => play(track, queue)}
      />

      <LyricsPanel
        isOpen={isLyricsOpen}
        onClose={closePanels}
        trackTitle={currentTrack.title}
        lyrics={currentTrack.lyrics}
      />

      <style>{`
        .player-desktop {
          display: flex;
        }
        .player-mobile {
          display: none;
        }
        @media (max-width: 768px) {
          .player-desktop {
            display: none;
          }
          .player-mobile {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
