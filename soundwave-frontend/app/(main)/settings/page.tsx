'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLocaleStore, type Language } from '@/lib/store/localeStore';
import { getMyPreferences, updateMyPreferences, type UserPreferences } from '@/lib/api/playback';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { Card, Checkbox, Select, Button, Modal } from '@/components/ui';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { useTranslation } from '@/lib/i18n';

// Settings-page toggle keys map onto apps.playback.UserPreference's four
// notify_* booleans — "account status" -> artist verification result,
// "system" -> ticket replies, the two closest matches on the backend.
const NOTIF_KEY_MAP = {
  notifySubscription: 'notifySubscription',
  notifyNewRelease: 'notifyNewReleases',
  notifyAccountStatus: 'notifyArtistVerification',
  notifySystem: 'notifyTickets',
} as const satisfies Record<string, keyof UserPreferences>;

type NotifToggleKey = keyof typeof NOTIF_KEY_MAP;

export default function SettingsPage() {
  const { t } = useTranslation('settingsPage');

  const TIER_LABEL: Record<string, string> = { free: t('tierFree'), silver: t('tierSilver'), gold: t('tierGold') };

  const NOTIF_TOGGLES: { key: NotifToggleKey; label: string }[] = [
    { key: 'notifySubscription', label: t('notifySubscription') },
    { key: 'notifyNewRelease', label: t('notifyNewRelease') },
    { key: 'notifyAccountStatus', label: t('notifyAccountStatus') },
    { key: 'notifySystem', label: t('notifySystem') },
  ];
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (user) getMyPreferences().then(setPreferences);
  }, [user]);

  if (!user || !preferences) return <p>{t('loading')}</p>;

  const updatePreference = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => (prev ? { ...prev, [key]: value } : prev));
    await updateMyPreferences({ [key]: value });
  };

  const plan = SUBSCRIPTION_PLANS[user.subscription];

  const handleDeleteAccount = () => {
    setIsDeleteOpen(false);
    logout();
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
        <ChangePasswordForm />
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
          {NOTIF_TOGGLES.map(({ key, label }) => {
            const prefKey = NOTIF_KEY_MAP[key];
            return (
              <Checkbox
                key={key}
                label={label}
                checked={preferences[prefKey] as boolean}
                onChange={(e) => updatePreference(prefKey, e.target.checked as UserPreferences[typeof prefKey])}
              />
            );
          })}
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
            value={preferences.systemVolume}
            onChange={(e) => updatePreference('systemVolume', Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--color-primary)' }}
          />
          <span style={{ minWidth: 40, textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            {preferences.systemVolume}%
          </span>
        </div>
      </Card>

      <Card>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          {t('languageTitle')}
        </h3>
        <Select
          value={language}
          onChange={(e) => {
            const next = e.target.value as Language;
            setLanguage(next);
            updatePreference('language', next);
          }}
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
