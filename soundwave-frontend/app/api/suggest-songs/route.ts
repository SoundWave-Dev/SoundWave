// ============================================================
// SOUNDWAVE — SONG SUGGESTION API ROUTE
// POST /api/suggest-songs
//
// Takes user's listening history + preferences and returns
// a list of suggested track IDs with reasoning.
//
// In Phase 1: uses mock tracks as the catalog.
// In Phase 2: replace MOCK_TRACKS with a real DB query.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_TRACKS } from '@/lib/mock/data';
import type { Track } from '@/types';

interface SuggestionRequest {
  recentlyPlayedIds: string[];   // tracks user played recently
  likedGenres: string[];         // genres user listens to most
  dislikedTrackIds?: string[];   // tracks to explicitly exclude
  mood?: string;                 // optional: 'energetic' | 'calm' | 'sad' | 'happy'
}

interface SuggestionResult {
  trackId: string;
  reason: string;   // short Persian explanation why this was suggested
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestionRequest = await req.json();
    const { recentlyPlayedIds, likedGenres, dislikedTrackIds = [], mood } = body;

    // Build a catalog summary for the model (only what it needs)
    const catalog = MOCK_TRACKS
      .filter((t) => !dislikedTrackIds.includes(t.id))
      .map((t) => ({
        id: t.id,
        title: t.title,
        genre: t.genre ?? 'Unknown',
        artists: t.artists.map((a) => a.stageName).join(', '),
        streamCount: t.streamCount,
      }));

    const recentlyPlayed = MOCK_TRACKS
      .filter((t) => recentlyPlayedIds.includes(t.id))
      .map((t) => `${t.title} (${t.genre ?? 'Unknown'}) - ${t.artists.map(a => a.stageName).join(', ')}`);

    const prompt = `
تو یک سیستم پیشنهاددهنده موسیقی هستی برای یک سرویس استریم موسیقی ایرانی به نام Soundwave.

اطلاعات کاربر:
- آهنگ‌های اخیراً شنیده‌شده: ${recentlyPlayed.length > 0 ? recentlyPlayed.join(', ') : 'هیچ‌کدام'}
- ژانرهای مورد علاقه: ${likedGenres.length > 0 ? likedGenres.join(', ') : 'نامشخص'}
${mood ? `- حال‌وهوا: ${mood}` : ''}

کاتالوگ آهنگ‌های موجود:
${JSON.stringify(catalog, null, 2)}

وظیفه: حداکثر ۳ آهنگ از کاتالوگ بالا پیشنهاد بده که با سلیقه و حال‌وهوای کاربر مطابقت داشته باشد.
برای هر پیشنهاد یک دلیل کوتاه به فارسی بنویس (حداکثر ۱۵ کلمه).

پاسخ را دقیقاً به این فرمت JSON برگردان، بدون هیچ متن اضافه‌ای:
[
  { "trackId": "t1", "reason": "دلیل پیشنهاد" },
  { "trackId": "t2", "reason": "دلیل پیشنهاد" }
]
`.trim();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text ?? '[]';

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, '').trim();
    const suggestions: SuggestionResult[] = JSON.parse(clean);

    // Hydrate with full track data
    const result = suggestions
      .map((s) => {
        const track = MOCK_TRACKS.find((t) => t.id === s.trackId);
        if (!track) return null;
        return { track, reason: s.reason };
      })
      .filter(Boolean) as { track: Track; reason: string }[];

    return NextResponse.json({ suggestions: result });

  } catch (err) {
    console.error('[suggest-songs]', err);
    return NextResponse.json(
      { error: 'خطا در دریافت پیشنهادها' },
      { status: 500 }
    );
  }
}
