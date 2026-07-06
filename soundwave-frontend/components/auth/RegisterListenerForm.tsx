'use client';

// ============================================================
// SOUNDWAVE — LISTENER REGISTRATION FORM
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerListenerSchema,
  type RegisterListenerFormValues,
} from '@/lib/validators/registerListenerSchema';
import { useAuthStore } from '@/lib/store/authStore';
import { Button, Checkbox, Input, Select } from '@/components/ui';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

const GENDER_OPTIONS = [
  { value: 'male', label: 'مرد' },
  { value: 'female', label: 'زن' },
  { value: 'other', label: 'سایر' },
  { value: 'prefer_not_to_say', label: 'ترجیح می‌دهم نگویم' },
];

export function RegisterListenerForm() {
  const router = useRouter();
  const registerListener = useAuthStore((s) => s.registerListener);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterListenerFormValues>({ resolver: zodResolver(registerListenerSchema) });

  const onSubmit = async (values: RegisterListenerFormValues) => {
    setServerError(null);
    try {
      await registerListener(values);
      router.push('/home');
    } catch {
      setServerError('ثبت‌نام با خطا مواجه شد. دوباره تلاش کنید.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Input label="نام نمایشی" placeholder="نام شما" error={errors.displayName?.message} {...register('displayName')} />
      <Input label="ایمیل" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Input label="رمز عبور" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
      <Input
        label="تکرار رمز عبور"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Input label="تاریخ تولد" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
      <Select
        label="جنسیت"
        placeholder="انتخاب کنید"
        options={GENDER_OPTIONS}
        error={errors.gender?.message}
        {...register('gender')}
      />
      <Checkbox
        error={errors.privacyPolicy?.message}
        label={
          <>
            <button
              type="button"
              onClick={() => setIsPolicyOpen(true)}
              style={{ color: 'var(--color-primary)', fontWeight: 600 }}
            >
              سیاست حریم خصوصی
            </button>{' '}
            را مطالعه کرده و می‌پذیرم
          </>
        }
        {...register('privacyPolicy')}
      />

      {serverError && (
        <div style={{ background: 'rgba(233, 71, 90, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)' }}>
          {serverError}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
        {isSubmitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
      </Button>

      <PrivacyPolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
    </form>
  );
}
