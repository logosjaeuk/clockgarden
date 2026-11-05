import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { supportedLocales } from '../config';
import { pathFor } from '../i18n';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://clockgarden.com');
  const articles = await getCollection('articles');

  const categories = ['mechanics', 'history', 'astronomy', 'horology-care'];

  const staticRoutes = [
    '/',
    '/articles/',
    '/about/',
    '/editorial-policy/',
    '/contact/',
    '/terms/',
    '/privacy/',
  ];

  const categoryRoutes = categories.map((cat) => `/category/${cat}/`);
  const articleRoutes = articles.map((a) => `/articles/${a.id}/`);

  const allRelativePaths = [...staticRoutes, ...categoryRoutes, ...articleRoutes];

  const allLocalizedPaths = supportedLocales.flatMap((locale) =>
    allRelativePaths.map((path) => pathFor(locale, path))
  );

  // Deduplicate
  const uniquePaths = Array.from(new Set(allLocalizedPaths));

  const urlEntries = uniquePaths.map((path) => {
    const loc = new URL(path, base).href;
    const matchedArticle = articles.find((a) => path.includes(`/articles/${a.id}/`));
    const lastmod = matchedArticle ? (matchedArticle.data.updatedDate || matchedArticle.data.pubDate) : '2026-10-25';
    const changefreq = matchedArticle ? 'monthly' : 'weekly';
    const priority = path === '/' || path === '/ko/' ? '1.0' : path.includes('/articles/') ? '0.8' : '0.6';

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
