// ============================================================
// SOUNDWAVE — CHANGE PASSWORD VALIDATION
// ============================================================

import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
    newPassword: z.string().min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد'),
    confirmNewPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'رمز عبور جدید و تکرار آن مطابقت ندارند',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
