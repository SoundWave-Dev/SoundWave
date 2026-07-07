'use client';

// ============================================================
// SOUNDWAVE — SUPPORT / ADMIN DASHBOARD
// Owner: Foad
// Visible only to role === 'support' || role === 'admin'
// ============================================================

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
// import { RequireRole } from '@/components/auth/RequireRole'; // TEMP (testing only): see below
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { Tabs } from '@/components/ui';
import { ArtistApprovalTable } from '@/components/dashboard/ArtistApprovalTable';
import { TicketList } from '@/components/dashboard/TicketList';
import { PayoutTable } from '@/components/dashboard/PayoutTable';
import { PriceControlPanel } from '@/components/dashboard/PriceControlPanel';

type DashboardTab = 'verification' | 'tickets' | 'accounting' | 'subscriptions';

function DashboardContent() {
  const authUser = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock admin user so the page (and
  // its admin-only tabs) is viewable without logging in. Remove this
  // fallback (go back to `const user = authUser`) before shipping/committing.
  const user = authUser ?? MOCK_USERS[3];
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState<DashboardTab>('verification');

  const tabs = [
    { key: 'verification', label: 'تایید هنرمندان' },
    { key: 'tickets', label: 'تیکت‌های پشتیبانی' },
    ...(isAdmin ? [{ key: 'accounting', label: 'حسابرسی' }] : []),
    ...(isAdmin ? [{ key: 'subscriptions', label: 'مدیریت اشتراک‌ها' }] : []),
  ];

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
        داشبورد پشتیبانی و مدیریت
      </h1>

      <Tabs tabs={tabs} activeKey={tab} onChange={(key) => setTab(key as DashboardTab)} />

      {tab === 'verification' && <ArtistApprovalTable />}
      {tab === 'tickets' && <TicketList />}
      {tab === 'accounting' && isAdmin && <PayoutTable isAdmin={isAdmin} />}
      {tab === 'subscriptions' && isAdmin && <PriceControlPanel />}
    </div>
  );
}

export default function SupportDashboardPage() {
  // TEMP (testing only): auth guard disabled, restore the <RequireRole>
  // wrapper below before shipping/committing.
  return (
    // <RequireRole allow={['support', 'admin']}>
      <DashboardContent />
    // </RequireRole>
  );
}
