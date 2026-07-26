'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useLocaleStore, type Language } from '@/lib/store/localeStore';
import { mockGetUserSettings, mockUpdateUserSettings, DEFAULT_USER_SETTINGS, type UserSettings } from '@/lib/mock/store';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { SUBSCRIPTION_PLANS, ROUTES } from '@/lib/constants';
import { Card, Checkbox, Select, Button, Modal } from '@/components/ui';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { useTranslation } from '@/lib/i18n';

export default function SettingsPage() {
  const { t } = useTranslation('settingsPage');

  const TIER_LABEL: Record<string, string> = { free: t('tierFree'), silver: t('tierSilver'), gold: t('tierGold') };

  const NOTIF_TOGGLES: { key: keyof UserSettings; label: string }[] = [
    { key: 'notifySubscription', label: t('notifySubscription') },
    { key: 'notifyNewRelease', label: t('notifyNewRelease') },
    { key: 'notifyAccountStatus', label: t('notifyAccountStatus') },
    { key: 'notifySystem', label: t('notifySystem') },
  ];
  const authUser = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock user so the page is viewable
  // without logging in. Remove this fallback (go back to
  // `const user = authUser` + the early return) before shipping/committing.
  const user = authUser ?? MOCK_USERS[1];
  const logout = useAuthStore((s) => s.logout);
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setSettings(mockGetUserSettings());
  }, []);

  if (!user) return <p>{t('loading')}</p>;

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
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {t('title')}
      </h1>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          {t('profileTitle')}
        </h3>
        <ProfileForm user={user} />
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          {t('changePasswordTitle')}
        </h3>
        <ChangePasswordForm email={user.email} />
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          {t('subscriptionTitle')}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{t('currentPlan')}</span>
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{TIER_LABEL[user.subscription]}</span>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-5) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.dailyStreamLimit === null ? t('unlimitedDailyStream') : t('limitedDailyStream').replace('{count}', String(plan.features.dailyStreamLimit))}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.playlistLimit === null ? t('unlimitedPlaylist') : t('limitedPlaylist').replace('{count}', String(plan.features.playlistLimit))}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.download ? t('downloadAllowed') : t('downloadNotAllowed')}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.earlyAccess ? t('earlyAccessAllowed') : t('earlyAccessNotAllowed')}
          </li>
          <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {plan.features.viewStats ? t('viewStatsAllowed') : t('viewStatsNotAllowed')}
          </li>
        </ul>

        <Button variant="secondary" disabled title={t('upgradeTooltip')}>
          {t('upgradeButton')}
        </Button>
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          {t('notificationsTitle')}
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
          {t('systemVolumeTitle')}
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
          {t('languageTitle')}
        </h3>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          options={[
            { value: 'fa', label: 'فارسی' },
            { value: 'en', label: 'English' },
          ]}
        />
      </Card>

      <Card style={{ borderColor: 'var(--color-error)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
          {t('deleteAccountTitle')}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          {t('deleteAccountDescription')}
        </p>
        <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
          {t('deleteAccountButton')}
        </Button>
      </Card>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={t('deleteAccountTitle')}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
          {t('deleteAccountConfirmMessage')}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDeleteAccount}>{t('confirmDelete')}</Button>
        </div>
      </Modal>
    </div>
  );
}
