// ============================================================
// SOUNDWAVE — PLAYER TESTS
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Player } from '@/components/player/Player';
import { usePlayerStore } from '@/lib/store/playerStore';
import type { Track } from '@/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('howler', () => {
  class Howl {
    constructor(_opts: unknown) {}
    play() {}
    pause() {}
    playing() { return false; }
    seek() { return 0; }
    duration() { return 0; }
    volume() {}
    unload() {}
  }
  return { Howl };
});

const track: Track = {
  id: 't1',
  title: 'Test Track',
  duration: 200,
  audioUrl: '/mock/audio/test.mp3',
  coverUrl: null,
  lyrics: null,
  genre: 'Pop',
  releaseYear: 2020,
  albumId: null,
  albumTitle: null,
  artists: [{ id: 'a1', stageName: 'Test Artist' }],
  streamCount: 100,
  uniqueListeners: 50,
  isEarlyAccess: false,
  createdAt: new Date().toISOString(),
};

function resetStore() {
  usePlayerStore.setState({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    isMuted: false,
    repeatMode: 'none',
    isShuffled: false,
    history: [],
  });
}

describe('Player', () => {
  beforeEach(() => {
    resetStore();
    usePlayerStore.setState({ currentTrack: track, queue: [track] });
  });

  it('renders the current track title', () => {
    render(<Player />);
    expect(screen.getAllByText('Test Track').length).toBeGreaterThan(0);
  });

  it('toggles isPlaying when the play/pause button is clicked', async () => {
    const user = userEvent.setup();
    render(<Player />);
    expect(usePlayerStore.getState().isPlaying).toBe(false);

    const [playButton] = screen.getAllByRole('button', { name: 'پخش' });
    await user.click(playButton);

    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it('cycles repeat mode none → all → one → none', async () => {
    const user = userEvent.setup();
    render(<Player />);
    expect(usePlayerStore.getState().repeatMode).toBe('none');

    const [repeatButton] = screen.getAllByRole('button', { name: 'تکرار خاموش است' });

    await user.click(repeatButton);
    expect(usePlayerStore.getState().repeatMode).toBe('all');

    await user.click(repeatButton);
    expect(usePlayerStore.getState().repeatMode).toBe('one');

    await user.click(repeatButton);
    expect(usePlayerStore.getState().repeatMode).toBe('none');
  });

  it('flips the isShuffled flag when the shuffle button is clicked', async () => {
    const user = userEvent.setup();
    render(<Player />);
    expect(usePlayerStore.getState().isShuffled).toBe(false);

    const [shuffleButton] = screen.getAllByRole('button', { name: 'روشن کردن پخش تصادفی' });
    await user.click(shuffleButton);

    expect(usePlayerStore.getState().isShuffled).toBe(true);
  });
});
