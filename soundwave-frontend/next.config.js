// ============================================================
// SOUNDWAVE — NEXT.JS CONFIG
// PWA is enabled via next-pwa. In development it is disabled
// so hot-reload works normally. In production the service
// worker is generated automatically under /public/sw.js.
// ============================================================

const withPWA = require('next-pwa')({
  dest: 'public',           // output sw.js + workbox files here
  disable: process.env.NODE_ENV === 'development',
  register: true,           // auto-register the SW on page load
  skipWaiting: true,        // activate new SW immediately
  runtimeCaching: [
    // Cache page navigations (HTML)
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'soundwave-pages',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
    // Cache static assets (JS/CSS/fonts)
    {
      urlPattern: /\.(js|css|woff2?|ttf|otf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'soundwave-static',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // Cache images
    {
      urlPattern: /\.(png|jpg|jpeg|webp|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'soundwave-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = withPWA(nextConfig);
