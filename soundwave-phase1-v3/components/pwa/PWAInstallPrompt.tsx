'use client';

// ============================================================
// SOUNDWAVE — PWA INSTALL PROMPT
// Shows a custom "Add to Home Screen" banner on mobile.
// Place this inside the main layout so it appears site-wide.
//
// How it works:
//   - Browser fires `beforeinstallprompt` when the PWA is
//     installable (manifest OK + SW registered + HTTPS).
//   - We capture that event and show our own styled banner.
//   - User clicks "نصب" → we call prompt() on the event.
//   - We remember dismissal in localStorage so it doesn't
//     re-appear every session.
// ============================================================

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'sw_pwa_install_dismissed';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--player-height) + var(--space-4))',
      right: 'var(--space-4)',
      left: 'var(--space-4)',
      zIndex: 200,
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-4) var(--space-5)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideUp 0.3s ease',
    }}>
      {/* Icon */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        flexShrink: 0,
      }}>
        🎵
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
        }}>
          Soundwave را نصب کنید
        </div>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          marginTop: 2,
        }}>
          دسترسی سریع‌تر، مثل یک اپ واقعی
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            background: 'transparent',
          }}
        >
          بعداً
        </button>
        <button
          onClick={handleInstall}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: '#000',
            background: 'var(--color-primary)',
            transition: 'opacity var(--transition-fast)',
          }}
        >
          نصب
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
