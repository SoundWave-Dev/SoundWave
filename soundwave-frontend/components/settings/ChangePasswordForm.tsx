'use client';

// ============================================================
// SOUNDWAVE — SETTINGS: CHANGE PASSWORD FORM
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/changePasswordSchema';
import { changePassword } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { Button, Input } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export function ChangePasswordForm() {
  const { t } = useTranslation('changePasswordForm');
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
    try {
      await changePassword(values.currentPassword, values.newPassword);
    } catch (error) {
      setServerError(getApiErrorMessage(error, t('incorrectCurrentPassword')));
      return;
    }
    reset();
    setSuccessMessage(t('updateSuccess'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Input
        label={t('currentPasswordLabel')}
        type="password"
        placeholder="••••••••"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <Input
        label={t('newPasswordLabel')}
        type="password"
        placeholder="••••••••"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label={t('confirmNewPasswordLabel')}
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
        {isSubmitting ? t('saving') : t('submit')}
      </Button>
    </form>
  );
}
