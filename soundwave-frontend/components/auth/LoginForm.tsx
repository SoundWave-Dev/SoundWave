'use client';

// ============================================================
// SOUNDWAVE — LOGIN FORM
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validators/loginSchema';
import { useAuthStore } from '@/lib/store/authStore';
import { Button, Input } from '@/components/ui';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const success = await login(values.email, values.password);
    if (!success) {
      setServerError('ایمیل یا رمز عبور اشتباه است.');
      return;
    }
    const user = useAuthStore.getState().user;
    if (user?.role === 'support' || user?.role === 'admin') {
      router.push('/support');
    } else {
      router.push('/home');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Input
        label="ایمیل"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="رمز عبور"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
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

      <button
        type="button"
        onClick={() => setIsForgotOpen(true)}
        style={{ alignSelf: 'flex-end', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}
      >
        رمز عبور خود را فراموش کرده‌اید؟
      </button>

      <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
        {isSubmitting ? 'در حال ورود...' : 'ورود'}
      </Button>

      <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        حساب کاربری ندارید؟{' '}
        <button type="button" onClick={onSwitchToRegister} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          ثبت‌نام
        </button>
      </div>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </form>
  );
}
