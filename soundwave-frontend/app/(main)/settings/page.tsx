'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { mockGetUserSettings, mockUpdateUserSettings, DEFAULT_USER_SETTINGS, type UserSettings } from '@/lib/mock/store';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { SUBSCRIPTION_PLANS, ROUTES } from '@/lib/constants';
import { Card, Checkbox, Select, Button, Modal } from '@/components/ui';

const TIER_LABEL: Record<string, string> = { free: 'رایگان', silver: 'نقره‌ای', gold: 'طلایی' };

const NOTIF_TOGGLES: { key: keyof UserSettings; label: string }[] = [
  { key: 'notifySubscription', label: 'انقضا و تمدید اشتراک' },
  { key: 'notifyNewRelease', label: 'انتشار آهنگ جدید از هنرمندان دنبال‌شده' },
  { key: 'notifyAccountStatus', label: 'وضعیت درخواست‌های هنرمندی و تیکت‌ها' },
  { key: 'notifySystem', label: 'اعلان‌های عمومی سامانه' },
];

export default function SettingsPage() {
  const authUser = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock user so the page is viewable
  // without logging in. Remove this fallback (go back to
  // `const user = authUser` + the early return) before shipping/committing.
  const user = authUser ?? MOCK_USERS[1];
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setSettings(mockGetUserSettings());
  }, []);

  if (!user) return <p>در حال بارگذاری...</p>;

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(mockUpdateUserSettings({ [key]: value } as Partial<UserSettings>));
  };

  const plan = SUBSCRIPTION_PLANS[user.subscription];

  const handleDeleteAccount = () => {
    setIsDeleteOpen(false);
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        تنظیمات
      </h1>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          اشتراک
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>پلن فعلی</span>
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{TIER_LABEL[user.subscription]}</span>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-5) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.dailyStreamLimit === null ? '✅ استریم روزانه نامحدود' : `▫️ محدودیت ${plan.features.dailyStreamLimit} استریم در روز`}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.playlistLimit === null ? '✅ پلی‌لیست نامحدود' : `▫️ حداکثر ${plan.features.playlistLimit} پلی‌لیست`}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.download ? '✅ امکان دانلود آهنگ' : '▫️ بدون امکان دانلود'}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.earlyAccess ? '✅ دسترسی زودهنگام به آهنگ‌های جدید' : '▫️ بدون دسترسی زودهنگام'}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.viewStats ? '✅ مشاهده آمار دقیق آهنگ‌ها و هنرمندان' : '▫️ بدون مشاهده آمار دقیق'}
          </li>
        </ul>

        <Button variant="secondary" disabled title="این قابلیت در فاز دوم پروژه فعال می‌شود">
          ارتقا اشتراک (به‌زودی)
        </Button>
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          اعلانات
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {NOTIF_TOGGLES.map(({ key, label }) => (
            <Checkbox
              key={key}
              label={label}
              checked={Boolean(settings[key])}
              onChange={(e) => updateSetting(key, e.target.checked as UserSettings[typeof key])}
            />
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          صدای سامانه
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(e) => updateSetting('volume', Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--color-primary)' }}
          />
          <span style={{ minWidth: 40, textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            {settings.volume}%
          </span>
        </div>
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          زبان
        </h3>
        <Select
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value as UserSettings['language'])}
          options={[
            { value: 'fa', label: 'فارسی' },
            { value: 'en', label: 'English' },
          ]}
        />
      </Card>

      <Card style={{ borderColor: 'var(--color-error)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
          حذف حساب کاربری
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          با حذف حساب، تمام اطلاعات، پلی‌لیست‌ها و اشتراک شما برای همیشه از بین می‌رود.
        </p>
        <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
          حذف حساب کاربری
        </Button>
      </Card>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="حذف حساب کاربری">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
          آیا مطمئن هستید که می‌خواهید حساب کاربری خود را برای همیشه حذف کنید؟ این عمل قابل بازگشت نیست.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>انصراف</Button>
          <Button variant="danger" onClick={handleDeleteAccount}>حذف کن</Button>
        </div>
      </Modal>
    </div>
  );
}
