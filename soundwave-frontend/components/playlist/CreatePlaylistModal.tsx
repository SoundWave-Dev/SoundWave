'use client';

import { useState } from 'react';
import { Modal, Input, Button } from '@/components/ui';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreatePlaylistModal({ isOpen, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('نام پلی‌لیست را وارد کنید.');
      return;
    }
    onCreate(trimmed);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="ساخت پلی‌لیست جدید">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Input
          label="نام پلی‌لیست"
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          placeholder="مثلاً: آهنگ‌های مورد علاقه من"
        />
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={handleClose}>انصراف</Button>
          <Button type="submit" variant="primary">ساخت پلی‌لیست</Button>
        </div>
      </form>
    </Modal>
  );
}
