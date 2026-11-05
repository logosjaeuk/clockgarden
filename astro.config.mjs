import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL || 'https://clockgarden.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/ko': '/',
    '/ko/about': '/about',
    '/ko/contact': '/contact',
    '/ko/editorial-policy': '/editorial-policy',
    '/ko/privacy': '/privacy',
    '/ko/terms': '/terms',
    '/clock': '/',
    '/clock-with-seconds': '/',
    '/living-clock': '/',
    '/world-clock': '/',
  },
  build: { assets: '_assets', inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
