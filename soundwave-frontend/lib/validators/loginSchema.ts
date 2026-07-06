// ============================================================
// SOUNDWAVE — LOGIN FORM VALIDATION
// ============================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'ایمیل الزامی است').email('ایمیل معتبر نیست'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
