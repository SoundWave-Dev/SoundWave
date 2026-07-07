// ============================================================
// SOUNDWAVE — ROOT LAYOUT
// ============================================================

import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Soundwave',
  description: 'سرویس استریم موسیقی',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Soundwave',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'Soundwave',
    description: 'سرویس استریم موسیقی ایرانی',
  },
};

// Separate viewport export (required by Next.js 14)
export const viewport: Viewport = {
  themeColor: '#1DB954',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* PWA iOS icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        {/* Splash screens for iOS (optional but nice) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
