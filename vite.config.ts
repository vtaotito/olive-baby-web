import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'favicon-192.png',
        'favicon-512.png',
        'apple-touch-icon.png',
        'masked-icon.svg',
      ],
      manifest: {
        name: 'OlieCare - Rotina do Bebê',
        short_name: 'OlieCare',
        description: 'Acompanhe a rotina do seu bebê com tranquilidade. Registre alimentação, sono, fraldas e muito mais.',
        theme_color: '#738251',
        background_color: '#f7f8f3',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/dashboard',
        lang: 'pt-BR',
        dir: 'ltr',
        categories: ['health', 'lifestyle', 'medical'],
        icons: [
          {
            src: '/favicon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/dashboard-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Dashboard - Visão geral do dia do bebê',
          },
          {
            src: '/screenshots/dashboard-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard - Visão completa no desktop',
          },
        ],
        shortcuts: [
          {
            name: 'Registrar Amamentação',
            short_name: 'Amamentação',
            url: '/routines/feeding',
            icons: [{ src: '/favicon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Registrar Sono',
            short_name: 'Sono',
            url: '/routines/sleep',
            icons: [{ src: '/favicon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Registrar Fralda',
            short_name: 'Fralda',
            url: '/routines/diaper',
            icons: [{ src: '/favicon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Importar handlers de push notification no Service Worker
        importScripts: ['/sw-push.js'],
        // Estratégia de caching
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Cache de runtime para API calls
        runtimeCaching: [
          {
            // Cache de fontes do Google
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache de API - Network First (dados sempre frescos, com fallback offline)
            urlPattern: /\/api\/v1\/(stats|babies|routines|growth|milestones|vaccines).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hora
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Cache de imagens externas
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Limpar caches antigos
        cleanupOutdatedCaches: true,
        // Navegação fallback para SPA
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: false, // Desabilitar no dev para evitar problemas
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['date-fns', 'axios', 'zustand'],
        },
      },
    },
  },
});
