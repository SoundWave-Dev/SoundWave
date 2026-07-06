'use client';

// ============================================================
// SOUNDWAVE — PRIVACY POLICY MODAL
// ============================================================

import { Modal } from '@/components/ui';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="سیاست حریم خصوصی">
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
        <p>
          Soundwave به حریم خصوصی شما احترام می‌گذارد. اطلاعات شخصی شما شامل ایمیل، تاریخ تولد و جنسیت
          صرفاً برای شخصی‌سازی تجربه کاربری و مدیریت حساب کاربری‌تان استفاده می‌شود و بدون رضایت شما در
          اختیار اشخاص ثالث قرار نخواهد گرفت.
        </p>
        <p>
          سابقه پخش آهنگ‌ها و پلی‌لیست‌های شما ممکن است برای بهبود پیشنهادهای موسیقی مورد استفاده قرار
          گیرد. شما در هر زمان می‌توانید از طریق صفحه تنظیمات، درخواست حذف حساب کاربری خود را ثبت کنید.
        </p>
        <p>
          با تکمیل ثبت‌نام، شما با جمع‌آوری و پردازش داده‌های فوق مطابق این سیاست موافقت می‌کنید.
        </p>
      </div>
    </Modal>
  );
}
