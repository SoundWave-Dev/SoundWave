// ============================================================
// SOUNDWAVE — ARTIST TRACK UPLOAD VALIDATION
// ============================================================

import { z } from 'zod';

export const uploadTrackSchema = z.object({
  title: z.string().min(1, 'عنوان اثر الزامی است'),
  audioFileName: z.string().min(1, 'انتخاب فایل صوتی الزامی است'),
  coverFileName: z.string().min(1, 'انتخاب تصویر کاور الزامی است'),
  lyrics: z.string().optional(),
  genre: z.string().min(1, 'ژانر الزامی است'),
  releaseYear: z
    .number({ invalid_type_error: 'سال انتشار را وارد کنید' })
    .int()
    .min(1900, 'سال انتشار معتبر نیست')
    .max(new Date().getFullYear(), 'سال انتشار معتبر نیست'),
  type: z.enum(['single', 'album'], {
    errorMap: () => ({ message: 'نوع اثر را انتخاب کنید' }),
  }),
  collaborators: z.string().optional(),
});

export type UploadTrackFormValues = z.infer<typeof uploadTrackSchema>;
