'use client';

// ============================================================
// SOUNDWAVE — MUSIC PLAYER
// Desktop: fixed bottom bar. Mobile: mini player → fullscreen overlay.
// Owner: Iliya
// ============================================================

import { useEffect, useState } from 'react';
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

  // Panels are tied to whichever track was current when they were opened;
  // switching tracks must close them so a stale lyrics/queue panel doesn't
  // reappear relabelled for the new track.
  useEffect(() => {
    closePanels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

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
        padding: '0 var(--space-5)',
        gap: 'var(--space-6)',
      }}>
        {/* Options — first in DOM so it lands on the visual right under RTL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: '1 1 0%', minWidth: 0 }}>
          <VolumeControl volume={volume} isMuted={isMuted} onVolumeChange={setVolume} onToggleMute={toggleMute} />
          <span style={{ width: 1, height: 24, background: 'var(--color-border)' }} />
          <button
            type="button"
            aria-label="باز کردن صف پخش"
            aria-pressed={isQueueOpen}
            className="player-icon-btn"
            onClick={() => { setIsQueueOpen((v) => !v); setIsLyricsOpen(false); }}
            style={{
              background: isQueueOpen ? 'var(--color-primary-glow)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              width: 32,
              height: 32,
              color: isQueueOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: 'var(--text-lg)',
              cursor: 'pointer',
            }}
          >
            📋
          </button>
          {currentTrack.lyrics !== null && (
            <button
              type="button"
              aria-label="باز کردن متن آهنگ"
              aria-pressed={isLyricsOpen}
              className="player-icon-btn"
              onClick={() => { setIsLyricsOpen((v) => !v); setIsQueueOpen(false); }}
              style={{
                background: isLyricsOpen ? 'var(--color-primary-glow)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                width: 32,
                height: 32,
                color: isLyricsOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-lg)',
                cursor: 'pointer',
              }}
            >
              📝
            </button>
          )}
        </div>

        {/* Center — playback controls */}
        <div style={{ flex: '0 0 auto', width: 480, maxWidth: '40vw', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <ShuffleButton isShuffled={isShuffled} onClick={toggleShuffle} />
            <button
              type="button"
              aria-label="آهنگ قبلی"
              className="player-icon-btn"
              onClick={prev}
              style={{ background: 'transparent', border: 'none', borderRadius: 'var(--radius-full)', color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)', cursor: 'pointer', width: 36, height: 36 }}
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
                boxShadow: '0 2px 10px var(--color-primary-glow)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              aria-label="آهنگ بعدی"
              className="player-icon-btn"
              onClick={next}
              style={{ background: 'transparent', border: 'none', borderRadius: 'var(--radius-full)', color: 'var(--color-text-primary)', fontSize: 'var(--text-xl)', cursor: 'pointer', width: 36, height: 36 }}
            >
              ⏭
            </button>
            <RepeatButton repeatMode={repeatMode} onClick={cycleRepeat} />
          </div>

          <ProgressBar progress={progress} duration={currentTrack.duration} onSeek={seekTo} />
        </div>

        {/* Track info — last in DOM so it lands on the visual left under RTL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 0%', minWidth: 0, justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 0, textAlign: 'right' }}>
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

            <div style={{ display: 'flex', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', justifyContent: 'flex-end' }}>
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

          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt=""
              style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}>
              {currentTrack.title}
            </div>
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
        onOpenQueue={() => { setIsQueueOpen(true); setIsLyricsOpen(false); }}
        onOpenLyrics={() => { setIsLyricsOpen(true); setIsQueueOpen(false); }}
      />

      <QueuePanel
        isOpen={isQueueOpen}
        onClose={closePanels}
        queue={queue}
        currentTrackId={currentTrack.id}
        onPlayTrack={(track) => play(track, queue)}
      />

      <LyricsPanel
        isOpen={isLyricsOpen && currentTrack.lyrics !== null}
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
        .player-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .player-icon-btn:hover {
          background: var(--color-surface-2) !important;
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
