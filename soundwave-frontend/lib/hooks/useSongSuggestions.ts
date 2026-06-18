// ============================================================
// SOUNDWAVE — useSongSuggestions hook
// Calls /api/suggest-songs and manages loading/error state.
// ============================================================

import { useState, useCallback } from 'react';
import type { Track } from '@/types';

interface SuggestionResult {
  track: Track;
  reason: string;
}

interface UseSongSuggestionsOptions {
  recentlyPlayedIds: string[];
  likedGenres: string[];
  dislikedTrackIds?: string[];
  mood?: string;
}

interface SuggestionsState {
  suggestions: SuggestionResult[];
  isLoading: boolean;
  error: string | null;
}

export function useSongSuggestions() {
  const [state, setState] = useState<SuggestionsState>({
    suggestions: [],
    isLoading: false,
    error: null,
  });

  const fetchSuggestions = useCallback(async (opts: UseSongSuggestionsOptions) => {
    setState({ suggestions: [], isLoading: true, error: null });

    try {
      const res = await fetch('/api/suggest-songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });

      if (!res.ok) throw new Error('خطای شبکه');

      const data = await res.json();
      setState({ suggestions: data.suggestions, isLoading: false, error: null });
    } catch (err) {
      setState({
        suggestions: [],
        isLoading: false,
        error: err instanceof Error ? err.message : 'خطای ناشناخته',
      });
    }
  }, []);

  return { ...state, fetchSuggestions };
}
