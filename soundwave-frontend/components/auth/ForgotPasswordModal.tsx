'use client';

// ============================================================
// SOUNDWAVE — FORGOT PASSWORD MODAL
// Phase 1: UI only — no real email is sent.
// ============================================================

import { useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    setEmail('');
    setSent(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="بازیابی رمز عبور">
      {sent ? (
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          اگر حسابی با ایمیل «{email}» وجود داشته باشد، لینک بازیابی رمز عبور برای آن ارسال شد.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Input
            label="ایمیل"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" style={{ width: '100%' }}>
            ارسال لینک بازیابی
          </Button>
        </form>
      )}
    </Modal>
  );
}
