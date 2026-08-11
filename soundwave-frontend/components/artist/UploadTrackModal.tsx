'use client';

// ============================================================
// SOUNDWAVE — UPLOAD / EDIT TRACK MODAL
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadTrackSchema, type UploadTrackFormValues } from '@/lib/validators/uploadTrackSchema';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export interface UploadTrackSubmitValues extends UploadTrackFormValues {
  audioFile: File | null;
  coverFile: File | null;
}

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UploadTrackSubmitValues) => void;
  initialValues?: Partial<UploadTrackFormValues>;
}

export function UploadTrackModal({ isOpen, onClose, onSubmit, initialValues }: UploadTrackModalProps) {
  const { t } = useTranslation('uploadTrackModal');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const TYPE_OPTIONS = [
    { value: 'single', label: t('typeSingle') },
    { value: 'album', label: t('typeAlbum') },
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadTrackFormValues>({
    resolver: zodResolver(uploadTrackSchema),
    defaultValues: initialValues,
  });

  const audioFileName = watch('audioFileName');
  const coverFileName = watch('coverFileName');

  const handleFormSubmit = (values: UploadTrackFormValues) => {
    onSubmit({ ...values, audioFile, coverFile });
    reset();
    setAudioFile(null);
    setCoverFile(null);
  };

  const handleClose = () => {
    reset();
    setAudioFile(null);
    setCoverFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={initialValues ? t('editTitle') : t('createTitle')}>
      <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label={t('titleLabel')} placeholder={t('titlePlaceholder')} error={errors.title?.message} {...register('title')} />

        <FileField
          label={t('audioLabel')}
          fileName={audioFileName}
          error={errors.audioFileName?.message}
          onSelect={(file) => {
            setAudioFile(file);
            setValue('audioFileName', file?.name ?? '', { shouldValidate: true });
          }}
          accept="audio/*"
          clickToSelectFile={t('clickToSelectFile')}
        />

        <FileField
          label={t('coverLabel')}
          fileName={coverFileName}
          error={errors.coverFileName?.message}
          onSelect={(file) => {
            setCoverFile(file);
            setValue('coverFileName', file?.name ?? '', { shouldValidate: true });
          }}
          accept="image/*"
          clickToSelectFile={t('clickToSelectFile')}
        />

        <Textarea label={t('lyricsLabel')} placeholder={t('lyricsPlaceholder')} {...register('lyrics')} />

        <Input label={t('genreLabel')} placeholder="Pop, Rock, ..." error={errors.genre?.message} {...register('genre')} />

        <Input
          label={t('releaseYearLabel')}
          type="number"
          error={errors.releaseYear?.message}
          {...register('releaseYear', { valueAsNumber: true })}
        />

        <Select label={t('typeLabel')} options={TYPE_OPTIONS} placeholder={t('typePlaceholder')} error={errors.type?.message} {...register('type')} />

        <Input
          label={t('collaboratorsLabel')}
          placeholder={t('collaboratorsPlaceholder')}
          {...register('collaborators')}
        />

        <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
          {initialValues ? t('saveChanges') : t('publish')}
        </Button>
      </form>
    </Modal>
  );
}

function FileField({
  label,
  fileName,
  error,
  onSelect,
  accept,
  clickToSelectFile,
}: {
  label: string;
  fileName?: string;
  error?: string;
  onSelect: (file: File | null) => void;
  accept: string;
  clickToSelectFile: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{label}</label>
      <label
        style={{
          border: `1px dashed ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
        }}
      >
        {fileName || clickToSelectFile}
        <input type="file" accept={accept} hidden onChange={(e) => onSelect(e.target.files?.[0] ?? null)} />
      </label>
      {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
}
