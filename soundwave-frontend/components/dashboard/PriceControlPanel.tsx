'use client';

// ============================================================
// SOUNDWAVE — SUBSCRIPTION PRICE CONTROL + REVENUE DASHBOARD
// (admin dashboard, Tab 4)
// Pie chart is drawn with plain SVG — no chart library.
// ============================================================

import { useEffect, useState } from 'react';
import type { SubscriptionTier } from '@/types';
import { mockGetUsers, mockGetSubscriptionPrices, mockUpdateSubscriptionPrices } from '@/lib/mock/store';
import { formatCount } from '@/lib/utils';
import { Button, Card, Input } from '@/components/ui';

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'var(--color-text-muted)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
};

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'رایگان',
  silver: 'نقره‌ای',
  gold: 'طلایی',
};

export function PriceControlPanel() {
  const [silver, setSilver] = useState(0);
  const [gold, setGold] = useState(0);
  const [saved, setSaved] = useState(false);

  const users = mockGetUsers();
  const counts: Record<SubscriptionTier, number> = { free: 0, silver: 0, gold: 0 };
  users.forEach((u) => counts[u.subscription]++);
  const total = users.length || 1;

  useEffect(() => {
    const prices = mockGetSubscriptionPrices();
    setSilver(prices.silver);
    setGold(prices.gold);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mockUpdateSubscriptionPrices({ silver, gold });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const revenue = counts.silver * silver + counts.gold * gold;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <SummaryCard label="کاربران رایگان" value={formatCount(counts.free)} />
        <SummaryCard label="کاربران نقره‌ای" value={formatCount(counts.silver)} />
        <SummaryCard label="کاربران طلایی" value={formatCount(counts.gold)} />
        <SummaryCard label="درآمد این ماه" value={`${formatCount(revenue)} تومان`} highlight />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <Card style={{ flex: '1 1 260px' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            توزیع کاربران بر اساس نوع اشتراک
          </h3>
          <SubscriptionPieChart counts={counts} total={total} />
        </Card>

        <Card style={{ flex: '1 1 260px' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            تنظیم قیمت اشتراک‌ها
          </h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="قیمت اشتراک نقره‌ای (تومان)"
              type="number"
              min={0}
              value={silver}
              onChange={(e) => setSilver(Number(e.target.value))}
            />
            <Input
              label="قیمت اشتراک طلایی (تومان)"
              type="number"
              min={0}
              value={gold}
              onChange={(e) => setGold(Number(e.target.value))}
            />
            <Button type="submit">به‌روزرسانی قیمت‌ها</Button>
            {saved && <span style={{ color: 'var(--color-primary)', fontSize: 'var(--text-xs)' }}>قیمت‌ها ذخیره شد.</span>}
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

function SubscriptionPieChart({ counts, total }: { counts: Record<SubscriptionTier, number>; total: number }) {
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
              {TIER_LABELS[tier]} ({counts[tier]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
