'use client';

// ============================================================
// SOUNDWAVE — LOGIN / REGISTER PAGE
// Owner: Foad
// ============================================================

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterListenerForm } from '@/components/auth/RegisterListenerForm';
import { RegisterArtistForm } from '@/components/auth/RegisterArtistForm';
import { useTranslation } from '@/lib/i18n';

type PrimaryTab = 'login' | 'register';
type RegisterTab = 'listener' | 'artist';

function LoginPageContent() {
  const { t } = useTranslation('loginPage');
  const searchParams = useSearchParams();
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [registerTab, setRegisterTab] = useState<RegisterTab>('listener');

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        direction: 'rtl',
      }}
    >
      <div
        className="sw-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-primary)',
          }}
        >
          🎵 Soundwave
        </div>

        <Tabs
          tabs={[
            { key: 'login', label: t('loginTab') },
            { key: 'register', label: t('registerTab') },
          ]}
          activeKey={primaryTab}
          onChange={(key) => setPrimaryTab(key as PrimaryTab)}
        />

        {primaryTab === 'login' ? (
          <LoginForm onSwitchToRegister={() => setPrimaryTab('register')} />
        ) : (
          <>
            <Tabs
              tabs={[
                { key: 'listener', label: t('listenerTab') },
                { key: 'artist', label: t('artistTab') },
              ]}
              activeKey={registerTab}
              onChange={(key) => setRegisterTab(key as RegisterTab)}
            />
            {registerTab === 'listener' ? <RegisterListenerForm /> : <RegisterArtistForm />}
          </>
        )}

        <div
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--color-primary-glow)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary)',
            textAlign: 'center',
          }}
        >
          {t('devHint')}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
