'use client';

import { useState } from 'react';
import { Modal, Input, Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void | Promise<void>;
}

export function CreatePlaylistModal({ isOpen, onClose, onCreate }: CreatePlaylistModalProps) {
  const { t } = useTranslation('createPlaylistModal');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('nameRequired'));
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate(trimmed);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('nameRequired'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modalTitle')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Input
          label={t('nameLabel')}
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          placeholder={t('namePlaceholder')}
        />
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={handleClose}>{t('cancel')}</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>{t('create')}</Button>
        </div>
      </form>
    </Modal>
  );
}
