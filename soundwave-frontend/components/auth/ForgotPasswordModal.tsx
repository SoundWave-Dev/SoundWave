'use client';

// ============================================================
// SOUNDWAVE — FORGOT PASSWORD MODAL
// Sends the reset request to the backend, which always responds 200
// regardless of whether the email exists (no account-existence leak).
// There's no "enter the emailed token" step yet — that would need its
// own page — so this only covers the request half of the flow.
// ============================================================

import { useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { requestPasswordReset } from '@/lib/api/auth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { t } = useTranslation('forgotPasswordModal');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setEmail('');
    setSent(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
    } finally {
      setIsSubmitting(false);
      setSent(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('title')}>
      {sent ? (
        <div className="sw-fade-in-up" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          {t('sentMessage').replace('{email}', email)}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Input
            label={t('emailLabel')}
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
            {t('submit')}
          </Button>
        </form>
      )}
    </Modal>
  );
}
