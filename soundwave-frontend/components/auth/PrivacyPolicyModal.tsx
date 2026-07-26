'use client';

// ============================================================
// SOUNDWAVE — PRIVACY POLICY MODAL
// ============================================================

import { Modal } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { t } = useTranslation('privacyPolicyModal');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
      <div
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.9,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <p>{t('paragraph1')}</p>
        <p>{t('paragraph2')}</p>
        <p>{t('paragraph3')}</p>
      </div>
    </Modal>
  );
}
