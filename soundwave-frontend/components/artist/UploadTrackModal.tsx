'use client';

// ============================================================
// SOUNDWAVE — UPLOAD / EDIT TRACK MODAL
// Phase 1: audio + cover "upload" is UI only — no real file transfer.
// ============================================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadTrackSchema, type UploadTrackFormValues } from '@/lib/validators/uploadTrackSchema';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UploadTrackFormValues) => void;
  initialValues?: Partial<UploadTrackFormValues>;
}

const TYPE_OPTIONS = [
  { value: 'single', label: 'تک‌آهنگ' },
  { value: 'album', label: 'آلبوم' },
];

export function UploadTrackModal({ isOpen, onClose, onSubmit, initialValues }: UploadTrackModalProps) {
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
    onSubmit(values);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={initialValues ? 'ویرایش اثر' : 'آپلود اثر جدید'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label="عنوان اثر" placeholder="نام آهنگ یا آلبوم" error={errors.title?.message} {...register('title')} />

        <FileField
          label="فایل صوتی (MP3 / WAV / FLAC)"
          fileName={audioFileName}
          error={errors.audioFileName?.message}
          onSelect={(name) => setValue('audioFileName', name, { shouldValidate: true })}
          accept="audio/*"
        />

        <FileField
          label="تصویر کاور"
          fileName={coverFileName}
          error={errors.coverFileName?.message}
          onSelect={(name) => setValue('coverFileName', name, { shouldValidate: true })}
          accept="image/*"
        />

        <Textarea label="متن ترانه (اختیاری)" placeholder="در صورت وجود، متن ترانه را وارد کنید" {...register('lyrics')} />

        <Input label="ژانر" placeholder="Pop, Rock, ..." error={errors.genre?.message} {...register('genre')} />

        <Input
          label="سال انتشار"
          type="number"
          error={errors.releaseYear?.message}
          {...register('releaseYear', { valueAsNumber: true })}
        />

        <Select label="نوع اثر" options={TYPE_OPTIONS} placeholder="انتخاب کنید" error={errors.type?.message} {...register('type')} />

        <Input
          label="هنرمندان همکار (اختیاری)"
          placeholder="نام هنرمندان را با کاما جدا کنید"
          {...register('collaborators')}
        />

        <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
          {initialValues ? 'ذخیره تغییرات' : 'انتشار اثر'}
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
}: {
  label: string;
  fileName?: string;
  error?: string;
  onSelect: (name: string) => void;
  accept: string;
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
        {fileName || 'برای انتخاب فایل کلیک کنید'}
        <input type="file" accept={accept} hidden onChange={(e) => onSelect(e.target.files?.[0]?.name ?? '')} />
      </label>
      {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
}
