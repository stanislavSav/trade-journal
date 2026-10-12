/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Served from https://<user>.github.io/trade-journal/
const base = '/trade-journal/'

// Shown in Settings → About (docs/i18n/plan.md §3 defaults). Read at build time, no runtime fetch.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // main.tsx registers the service worker itself.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'Trade Journal',
        short_name: 'Trades',
        description: 'Personal crypto trade journal. Data stays on this device.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f2f2f7',
        theme_color: '#f2f2f7',
        lang: 'en',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell (js/css/html) and the storage logos (src/storage-tags/icons); includeAssets, the manifest and its
        // icons are added by the plugin.
        globPatterns: ['**/*.{js,css,html}', 'assets/*.svg'],
        navigateFallback: 'index.html',
        // Opening the sample backup in the address bar must give the file, not the app (docs/demo-data/plan.md D16).
        navigateFallbackDenylist: [/\/sample-backup\.json$/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Prices must be live; the app keeps its own last-known copy in localStorage.
            urlPattern: ({ url }) => url.origin === 'https://api.coingecko.com',
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
