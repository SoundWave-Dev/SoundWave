'use client';

// ============================================================
// SOUNDWAVE — ARTIST REGISTRATION FORM
// Phase 1: portfolio "upload" is UI only — no real file transfer.
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerArtistSchema,
  type RegisterArtistFormValues,
} from '@/lib/validators/registerArtistSchema';
import { useAuthStore } from '@/lib/store/authStore';
import { Button, Input } from '@/components/ui';

export function RegisterArtistForm() {
  const registerArtist = useAuthStore((s) => s.registerArtist);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterArtistFormValues>({ resolver: zodResolver(registerArtistSchema) });

  const portfolioFileName = watch('portfolio');

  const onSubmit = async (values: RegisterArtistFormValues) => {
    setServerError(null);
    try {
      await registerArtist(values);
      setIsPending(true);
    } catch {
      setServerError('ثبت‌نام با خطا مواجه شد. دوباره تلاش کنید.');
    }
  };

  if (isPending) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.9,
        }}
      >
        <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>⏳</div>
        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          درخواست شما در انتظار بررسی است
        </div>
        پس از تایید تیم پشتیبانی، از طریق اعلانات و ایمیل مطلع خواهید شد.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Input label="ایمیل" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Input label="رمز عبور" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
      <Input label="نام هنری" placeholder="نام هنری شما" error={errors.stageName?.message} {...register('stageName')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>نمونه‌کار (Portfolio)</label>
        <label
          style={{
            border: `1px dashed ${errors.portfolio ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          {portfolioFileName || 'برای انتخاب فایل نمونه‌کار کلیک کنید'}
          <input
            type="file"
            hidden
            onChange={(e) => setValue('portfolio', e.target.files?.[0]?.name ?? '', { shouldValidate: true })}
          />
        </label>
        {errors.portfolio && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{errors.portfolio.message}</span>
        )}
      </div>

      {serverError && (
        <div style={{ background: 'rgba(233, 71, 90, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)' }}>
          {serverError}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
        {isSubmitting ? 'در حال ارسال...' : 'ارسال درخواست'}
      </Button>
    </form>
  );
}
