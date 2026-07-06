// ============================================================
// SOUNDWAVE — ARTIST REGISTRATION VALIDATION
// ============================================================

import { z } from 'zod';

export const registerArtistSchema = z.object({
  email: z.string().min(1, 'ایمیل الزامی است').email('ایمیل معتبر نیست'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  stageName: z.string().min(2, 'نام هنری باید حداقل ۲ کاراکتر باشد'),
  portfolio: z.string().min(1, 'ارسال نمونه‌کار الزامی است'),
});

export type RegisterArtistFormValues = z.infer<typeof registerArtistSchema>;
