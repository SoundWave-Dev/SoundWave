'use client';

// ============================================================
// SOUNDWAVE — UPGRADE / RENEW SUBSCRIPTION (spec §2.4/§3.2/§3.6)
// Lets the user pick a paid tier + billing period, starts a
// PaymentTransaction via apps.billing.SubscribeView, and sends the
// browser to the gateway's redirect_url to finish payment there.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubscriptionPlans, subscribeToPlan } from '@/lib/api/billing';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { ROUTES } from '@/lib/constants';
import type { SubscriptionPlan, SubscriptionTier } from '@/types';
import { Card, Button, Select } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

const PAID_TIERS: SubscriptionTier[] = ['silver', 'gold'];
const DURATIONS = [1, 3, 6, 12] as const;

export default function PaymentPage() {
  const { t } = useTranslation('paymentPage');
  const user = useAuthStore((s) => s.user);

  const TIER_LABEL: Record<SubscriptionTier, string> = { free: '', silver: t('tierSilver'), gold: t('tierGold') };
  const DURATION_LABEL: Record<(typeof DURATIONS)[number], string> = {
    1: t('duration1'),
    3: t('duration3'),
    6: t('duration6'),
    12: t('duration12'),
  };

  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('silver');
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionPlans().then(setPlans);
  }, []);

  if (!user || !plans) return <p>{t('loading')}</p>;

  const selectedPlan = plans.find((p) => p.tier === selectedTier);
  const total = (selectedPlan?.monthlyPrice ?? 0) * duration;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const redirectUrl = await subscribeToPlan(selectedTier, duration);
      window.location.href = redirectUrl;
    } catch (err) {
      setError(getApiErrorMessage(err, t('genericError')));
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
          {t('subtitle')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {PAID_TIERS.map((tier) => {
          const plan = plans.find((p) => p.tier === tier);
          if (!plan) return null;
          const isSelected = selectedTier === tier;
          const isCurrent = user.subscription === tier;
          return (
            <Card
              key={tier}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTier(tier)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTier(tier)}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                boxShadow: isSelected ? '0 0 0 1px var(--color-primary)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                  {TIER_LABEL[tier]}
                </span>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-primary)',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px var(--space-3)',
                    }}
                  >
                    {t('currentPlanBadge')}
                  </span>
                )}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
                  {plan.monthlyPrice.toLocaleString()}
                </span>{' '}
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {t('currencyToman')} {t('perMonth')}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {plan.features.dailyStreamLimit === null
                    ? t('unlimitedDailyStream')
                    : t('limitedDailyStream').replace('{count}', String(plan.features.dailyStreamLimit))}
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {plan.features.playlistLimit === null
                    ? t('unlimitedPlaylist')
                    : t('limitedPlaylist').replace('{count}', String(plan.features.playlistLimit))}
                </li>
                {plan.features.download && (
                  <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{t('downloadAllowed')}</li>
                )}
                {plan.features.earlyAccess && (
                  <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{t('earlyAccessAllowed')}</li>
                )}
                {plan.features.viewStats && (
                  <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{t('viewStatsAllowed')}</li>
                )}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Select
            label={t('durationLabel')}
            value={String(duration)}
            onChange={(e) => setDuration(Number(e.target.value) as (typeof DURATIONS)[number])}
            options={DURATIONS.map((d) => ({ value: String(d), label: DURATION_LABEL[d] }))}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{t('totalLabel')}</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
              {total.toLocaleString()} {t('currencyToman')}
            </span>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(233, 71, 90, 0.1)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {error}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('processingButton') : t('payButton')}
          </Button>
        </div>
      </Card>

      <Link
        href={ROUTES.SETTINGS}
        style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', textAlign: 'center' }}
      >
        {t('backToSettings')}
      </Link>
    </div>
  );
}
