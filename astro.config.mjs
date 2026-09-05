import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL || 'https://clockgarden.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { assets: '_assets', inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
