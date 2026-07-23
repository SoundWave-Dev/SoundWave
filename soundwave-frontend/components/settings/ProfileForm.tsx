'use client';

// ============================================================
// SOUNDWAVE — SETTINGS: PROFILE FORM
// Edit display name (username is system-assigned and not editable).
// ============================================================

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@/types';
import { profileSchema, type ProfileFormValues } from '@/lib/validators/profileSchema';
import { mockUpdateUserProfile } from '@/lib/mock/store';
import { useAuthStore } from '@/lib/store/authStore';
import { Button, Input } from '@/components/ui';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user.displayName },
    mode: 'onTouched',
  });

  useEffect(() => {
    reset({ displayName: user.displayName });
  }, [user.displayName, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setSuccessMessage(null);
    const updated = mockUpdateUserProfile(user.id, { displayName: values.displayName });
    if (updated) {
      updateUser({ displayName: updated.displayName });
      reset({ displayName: updated.displayName });
      setSuccessMessage('نام نمایشی با موفقیت به‌روزرسانی شد.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Input label="نام کاربری" value={user.username} disabled readOnly />
      <Input
        label="نام نمایشی"
        placeholder="نام نمایشی شما"
        error={errors.displayName?.message}
        {...register('displayName')}
      />
      <Input label="ایمیل" value={user.email} disabled readOnly />

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

      <Button type="submit" disabled={isSubmitting || !isDirty} style={{ alignSelf: 'flex-start' }}>
        {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </Button>
    </form>
  );
}
