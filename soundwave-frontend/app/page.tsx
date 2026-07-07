// ============================================================
// SOUNDWAVE — LANDING PAGE
// Public marketing page. Not gated by auth — RequireRole only
// wraps the (main) route group. The header switches between
// Login/Sign-up and a Dashboard button once the client knows
// whether a session exists (see LandingHeader.tsx).
// ============================================================

import Link from 'next/link';
import { LandingHeader } from '@/components/marketing/LandingHeader';
import { ScrollReveal } from '@/components/marketing/ScrollReveal';
import { ROUTES } from '@/lib/constants';

const FEATURES = [
  {
    icon: '🎧',
    title: 'کتابخانه‌ای بی‌پایان از موسیقی ایرانی',
    body: 'از کلاسیک‌های ماندگار تا تازه‌ترین انتشارها؛ جست‌وجو کنید، کشف کنید و بی‌وقفه گوش دهید.',
  },
  {
    icon: '🎚️',
    title: 'پخش‌کننده‌ای که همه‌چیز را بلد است',
    body: 'صف پخش، تکرار و پخش تصادفی، نمایش متن آهنگ و کنترل کامل صدا؛ دقیقاً همان‌طور که باید باشد.',
  },
  {
    icon: '✨',
    title: 'پیشنهاد هوشمند با هوش مصنوعی',
    body: 'بر اساس سلیقه و حال‌وهوای شما، آهنگ‌های بعدی را پیدا می‌کنیم — پیش از آنکه خودتان بخواهید.',
  },
  {
    icon: '🎤',
    title: 'ابزاری کامل برای هنرمندان',
    body: 'آثار خود را منتشر کنید، آمار استریم و شنوندگان را دنبال کنید و درآمد ماهانه خود را مدیریت نمایید.',
  },
  {
    icon: '📱',
    title: 'همه‌جا در دسترس',
    body: 'به‌عنوان یک اپلیکیشن نصب کنید و حتی بدون اینترنت به تجربه‌ی Soundwave دسترسی داشته باشید.',
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-bg)', direction: 'rtl', overflowX: 'hidden' }}>
      <LandingHeader />

      {/* Hero */}
      <section
        style={{
          minHeight: 'calc(100dvh - 73px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'var(--space-8)',
          position: 'relative',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 40% at 50% 30%, var(--color-primary-glow), transparent)',
            pointerEvents: 'none',
          }}
        />

        <div className="sw-fade-in-up" style={{ position: 'relative', maxWidth: 720 }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-6)',
            }}
          >
            موسیقی، بی‌وقفه<br />
            <span style={{ color: 'var(--color-primary)' }}>همراه شما</span>
          </h1>

          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: 520,
              margin: '0 auto var(--space-8)',
              lineHeight: 1.8,
            }}
          >
            Soundwave سرویس استریم موسیقی ایرانی است؛ جایی برای شنیدن، کشف کردن
            و اگر هنرمندید — به اشتراک گذاشتن آثارتان.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={ROUTES.REGISTER}
              className="sw-btn"
              style={{
                padding: 'var(--space-4) var(--space-8)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: '#000',
                fontWeight: 700,
                fontSize: 'var(--text-base)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              شروع رایگان
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="sw-btn"
              style={{
                padding: 'var(--space-4) var(--space-8)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontWeight: 700,
                fontSize: 'var(--text-base)',
              }}
            >
              ورود
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--space-16) var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.title}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-8)',
                  flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 96,
                    height: 96,
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--color-surface-1)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                  }}
                >
                  {feature.icon}
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    {feature.title}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.8 }}>
                    {feature.body}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <ScrollReveal>
        <section
          style={{
            textAlign: 'center',
            padding: 'var(--space-16) var(--space-8)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-6)',
            }}
          >
            همین حالا شروع کنید
          </h2>
          <Link
            href={ROUTES.REGISTER}
            className="sw-btn"
            style={{
              display: 'inline-block',
              padding: 'var(--space-4) var(--space-10)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: '#000',
              fontWeight: 700,
              fontSize: 'var(--text-base)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            ساخت حساب رایگان
          </Link>
        </section>
      </ScrollReveal>

      <footer
        style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-xs)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        © {new Date().getFullYear()} Soundwave
      </footer>
    </div>
  );
}
