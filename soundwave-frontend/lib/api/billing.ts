// ============================================================
// SOUNDWAVE — BILLING API (apps.billing)
// ============================================================

import type { ArtistPayoutRecord, SubscriptionPlan, SubscriptionTier } from '@/types';
import { apiClient } from './client';
import { type ApiPayout, type ApiSubscriptionPlan, mapPayout, mapSubscriptionPlan } from './mappers';

interface Paginated<T> {
  results: T[];
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await apiClient.get<Paginated<ApiSubscriptionPlan> | ApiSubscriptionPlan[]>('/billing/plans/');
  const list = Array.isArray(data) ? data : data.results;
  return list.map(mapSubscriptionPlan);
}

export async function updatePlanPrices(silverPrice: number, goldPrice: number): Promise<void> {
  await apiClient.patch('/billing/plans/price/', { silver_price: silverPrice, gold_price: goldPrice });
}

/** Kicks off a subscribe/renew/upgrade purchase. Returns the payment gateway's
 * redirect URL — the caller is responsible for sending the browser there. */
export async function subscribeToPlan(planTier: SubscriptionTier, durationMonths: 1 | 3 | 6 | 12): Promise<string> {
  const { data } = await apiClient.post<{ redirect_url: string }>('/billing/subscribe/', {
    plan_tier: planTier,
    duration_months: durationMonths,
  });
  return data.redirect_url;
}

export async function getSubscriptionDistribution(): Promise<Record<SubscriptionTier, number>> {
  const { data } = await apiClient.get<Record<SubscriptionTier, number>>('/billing/reports/subscription-distribution/');
  return { free: data.free ?? 0, silver: data.silver ?? 0, gold: data.gold ?? 0 };
}

export async function getRevenueSummary(): Promise<{ currentMonthRevenue: number; byTier: Record<string, number> }> {
  const { data } = await apiClient.get<{ current_month_revenue: string | number; by_tier: Record<string, string | number> }>(
    '/billing/reports/revenue-summary/'
  );
  return {
    currentMonthRevenue: Number(data.current_month_revenue),
    byTier: Object.fromEntries(Object.entries(data.by_tier).map(([tier, amount]) => [tier, Number(amount)])),
  };
}

export async function getPayouts(): Promise<ArtistPayoutRecord[]> {
  const { data } = await apiClient.get<Paginated<ApiPayout> | ApiPayout[]>('/billing/payouts/', {
    params: { page_size: 100 },
  });
  const list = Array.isArray(data) ? data : data.results;
  return list.map(mapPayout);
}

export async function confirmSettlement(payoutId: string): Promise<void> {
  await apiClient.post(`/billing/payouts/${payoutId}/confirm-settlement/`);
}
