'use client';

// ============================================================
// SOUNDWAVE — SUBSCRIPTION PRICE CONTROL + REVENUE DASHBOARD
// (admin dashboard, Tab 4)
// Pie chart is drawn with plain SVG — no chart library.
// ============================================================

import { useEffect, useState } from 'react';
import type { SubscriptionTier } from '@/types';
import { getSubscriptionPlans, getSubscriptionDistribution, getRevenueSummary, updatePlanPrices } from '@/lib/api/billing';
import { formatCount } from '@/lib/utils';
import { Button, Card, Input } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'var(--color-text-muted)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
};

export function PriceControlPanel() {
  const { t } = useTranslation('priceControlPanel');
  const TIER_LABELS: Record<SubscriptionTier, string> = {
    free: t('tierFree'),
    silver: t('tierSilver'),
    gold: t('tierGold'),
  };
  const [silver, setSilver] = useState(0);
  const [gold, setGold] = useState(0);
  const [saved, setSaved] = useState(false);
  const [counts, setCounts] = useState<Record<SubscriptionTier, number>>({ free: 0, silver: 0, gold: 0 });
  const [revenue, setRevenue] = useState(0);

  const total = counts.free + counts.silver + counts.gold || 1;

  useEffect(() => {
    getSubscriptionPlans().then((plans) => {
      setSilver(plans.find((p) => p.tier === 'silver')?.monthlyPrice ?? 0);
      setGold(plans.find((p) => p.tier === 'gold')?.monthlyPrice ?? 0);
    });
    getSubscriptionDistribution().then(setCounts);
    getRevenueSummary().then((r) => setRevenue(r.currentMonthRevenue));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePlanPrices(silver, gold);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <SummaryCard label={t('freeUsers')} value={formatCount(counts.free)} />
        <SummaryCard label={t('silverUsers')} value={formatCount(counts.silver)} />
        <SummaryCard label={t('goldUsers')} value={formatCount(counts.gold)} />
        <SummaryCard label={t('monthlyRevenue')} value={`${formatCount(revenue)} ${t('currencyToman')}`} highlight />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <Card style={{ flex: '1 1 260px' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            {t('distributionTitle')}
          </h3>
          <SubscriptionPieChart counts={counts} total={total} labels={TIER_LABELS} />
        </Card>

        <Card style={{ flex: '1 1 260px' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            {t('pricingTitle')}
          </h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label={t('silverPriceLabel')}
              type="number"
              min={0}
              value={silver}
              onChange={(e) => setSilver(Number(e.target.value))}
            />
            <Input
              label={t('goldPriceLabel')}
              type="number"
              min={0}
              value={gold}
              onChange={(e) => setGold(Number(e.target.value))}
            />
            <Button type="submit">{t('updatePrices')}</Button>
            {saved && <span style={{ color: 'var(--color-primary)', fontSize: 'var(--text-xs)' }}>{t('savedMessage')}</span>}
          </form>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card style={{ background: highlight ? 'var(--color-primary-glow)' : undefined }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
        {label}
      </div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
        {value}
      </div>
    </Card>
  );
}

function SubscriptionPieChart({
  counts,
  total,
  labels,
}: {
  counts: Record<SubscriptionTier, number>;
  total: number;
  labels: Record<SubscriptionTier, string>;
}) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const tiers: SubscriptionTier[] = ['free', 'silver', 'gold'];

  let offset = 0;
  const segments = tiers.map((tier) => {
    const fraction = counts[tier] / total;
    const dash = fraction * circumference;
    const segment = { tier, dash, offset };
    offset += dash;
    return segment;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <g transform="translate(80,80) rotate(-90)">
          {segments.map((seg) => (
            <circle
              key={seg.tier}
              r={radius}
              fill="transparent"
              stroke={TIER_COLORS[seg.tier]}
              strokeWidth={24}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
            />
          ))}
        </g>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {tiers.map((tier) => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: TIER_COLORS[tier] }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {labels[tier]} ({counts[tier]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
