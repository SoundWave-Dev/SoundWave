'use client';

// ============================================================
// SOUNDWAVE — SETTINGS: CHANGE PASSWORD FORM
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/changePasswordSchema';
import { mockChangePassword } from '@/lib/mock/store';
import { Button, Input } from '@/components/ui';

interface ChangePasswordFormProps {
  email: string;
}

export function ChangePasswordForm({ email }: ChangePasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    const success = mockChangePassword(email, values.currentPassword, values.newPassword);
    if (!success) {
      setServerError('رمز عبور فعلی اشتباه است.');
      return;
    }
    reset();
    setSuccessMessage('رمز عبور با موفقیت تغییر کرد.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Input
        label="رمز عبور فعلی"
        type="password"
        placeholder="••••••••"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <Input
        label="رمز عبور جدید"
        type="password"
        placeholder="••••••••"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label="تکرار رمز عبور جدید"
        type="password"
        placeholder="••••••••"
        error={errors.confirmNewPassword?.message}
        {...register('confirmNewPassword')}
      />

      {serverError && (
        <div
          className="sw-fade-in-down"
          style={{
            background: 'rgba(233, 71, 90, 0.1)',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {serverError}
        </div>
      )}

      {successMessage && (
        <div
          className="sw-fade-in-down"
          style={{
            background: 'var(--color-primary-glow)',
            border: '1px solid var(--color-primary)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {successMessage}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
        {isSubmitting ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
      </Button>
    </form>
  );
}
