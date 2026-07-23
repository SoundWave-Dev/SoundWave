// ============================================================
// SOUNDWAVE — PROFILE EDIT VALIDATION
// ============================================================

import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z.string().min(2, 'نام نمایشی باید حداقل ۲ کاراکتر باشد'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
