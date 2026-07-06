// ============================================================
// SOUNDWAVE — ARTIST REJECTION REASON VALIDATION
// ============================================================

import { z } from 'zod';

export const rejectReasonSchema = z.object({
  reason: z.string().min(5, 'دلیل رد درخواست باید حداقل ۵ کاراکتر باشد'),
});

export type RejectReasonFormValues = z.infer<typeof rejectReasonSchema>;
