import type { APIRoute } from 'astro';
import { toolPages } from '../content/toolPages';
import { supportedLocales } from '../config';
import { pathFor } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://clockgarden.com');
  const paths = supportedLocales.flatMap((locale) =>
    [
      '/',
      '/about/',
      '/contact/',
      '/terms/',
      '/privacy/',
      ...Object.keys(toolPages[locale]).map((tool) => `/${tool}/`),
    ].map((path) => pathFor(locale, path)),
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${new URL(path, base).href}</loc></url>`).join('')}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
