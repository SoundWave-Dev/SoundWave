// ============================================================
// SOUNDWAVE — LISTENER REGISTRATION VALIDATION
// ============================================================

import { z } from 'zod';

export const registerListenerSchema = z
  .object({
    displayName: z.string().min(2, 'نام نمایشی باید حداقل ۲ کاراکتر باشد'),
    email: z.string().min(1, 'ایمیل الزامی است').email('ایمیل معتبر نیست'),
    password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
    birthDate: z.string().min(1, 'تاریخ تولد الزامی است'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
      errorMap: () => ({ message: 'جنسیت را انتخاب کنید' }),
    }),
    privacyPolicy: z.literal(true, {
      errorMap: () => ({ message: 'پذیرش سیاست حریم خصوصی الزامی است' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
    path: ['confirmPassword'],
  });

export type RegisterListenerFormValues = z.infer<typeof registerListenerSchema>;
