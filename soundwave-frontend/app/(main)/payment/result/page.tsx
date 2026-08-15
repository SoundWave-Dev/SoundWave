'use client';

// ============================================================
// SOUNDWAVE — PAYMENT RESULT (spec §3.6)
// The gateway redirects the browser to apps.billing.PaymentCallbackView,
// which verifies/activates the subscription then 302s here with ?status=.
// This page just reflects that outcome and refreshes the cached user so
// the new subscription tier shows up immediately (e.g. in the sidebar).
// ============================================================

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getMe } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { ROUTES } from '@/lib/constants';
import { Card, Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

function PaymentResultContent() {
  const { t } = useTranslation('paymentPage');
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';
  const updateUser = useAuthStore((s) => s.updateUser);
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      getMe()
        .then((user) => updateUser(user))
        .finally(() => setRefreshed(true));
    } else {
      setRefreshed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <Card style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-2xl)' }}>{isSuccess ? '✅' : '❌'}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {isSuccess ? t('resultSuccessTitle') : t('resultFailedTitle')}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          {isSuccess ? t('resultSuccessBody') : t('resultFailedBody')}
        </p>

        {refreshed && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
            {isSuccess ? (
              <Link href={ROUTES.SETTINGS}>
                <Button>{t('resultBackToSettings')}</Button>
              </Link>
            ) : (
              <>
                <Link href={ROUTES.PAYMENT}>
                  <Button>{t('resultTryAgain')}</Button>
                </Link>
                <Link href={ROUTES.SETTINGS}>
                  <Button variant="secondary">{t('resultBackToSettings')}</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResultContent />
    </Suspense>
  );
}
