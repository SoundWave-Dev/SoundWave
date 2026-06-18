// ============================================================
// TEST — SongSuggestions API route
// ============================================================

import { useSongSuggestions } from '@/lib/hooks/useSongSuggestions';
import { renderHook, act } from '@testing-library/react';

// Mock fetch globally for tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockSuggestions = [
  {
    track: {
      id: 't1',
      title: 'Ey Iran',
      duration: 245,
      audioUrl: '/mock/audio/ey-iran.mp3',
      coverUrl: null,
      lyrics: null,
      genre: 'Traditional',
      releaseYear: 1990,
      albumId: 'al1',
      albumTitle: 'Classics Vol. 1',
      artists: [{ id: 'a1', stageName: 'Dariush' }],
      streamCount: 450000,
      uniqueListeners: 180000,
      isEarlyAccess: false,
      createdAt: '2023-03-10T00:00:00Z',
    },
    reason: 'ژانر مورد علاقه شما با این آهنگ مطابقت دارد',
  },
];

describe('useSongSuggestions', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('starts with empty state', () => {
    const { result } = renderHook(() => useSongSuggestions());
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets isLoading to true while fetching', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useSongSuggestions());

    act(() => {
      result.current.fetchSuggestions({ recentlyPlayedIds: [], likedGenres: ['Pop'] });
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('populates suggestions on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    const { result } = renderHook(() => useSongSuggestions());

    await act(async () => {
      await result.current.fetchSuggestions({ recentlyPlayedIds: [], likedGenres: ['Traditional'] });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestions).toHaveLength(1);
    expect(result.current.suggestions[0].track.title).toBe('Ey Iran');
    expect(result.current.suggestions[0].reason).toContain('ژانر');
  });

  it('sets error message on network failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useSongSuggestions());

    await act(async () => {
      await result.current.fetchSuggestions({ recentlyPlayedIds: [], likedGenres: [] });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.suggestions).toHaveLength(0);
  });
});
