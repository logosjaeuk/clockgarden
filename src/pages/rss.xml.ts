import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../config';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://clockgarden.com');
  const articles = await getCollection('articles');
  const sorted = articles.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  const items = sorted
    .map((article) => {
      const link = new URL(`/articles/${article.id}/`, base).href;
      return `    <item>
      <title><![CDATA[${article.data.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${article.data.description}]]></description>
      <pubDate>${new Date(article.data.pubDate).toUTCString()}</pubDate>
      <category><![CDATA[${article.data.category}]]></category>
      <author><![CDATA[editorial@clockgarden.com (${article.data.author})]]></author>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} — 시계학 저널</title>
    <link>${base.href}</link>
    <description>${siteConfig.description}</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${new URL('/rss.xml', base).href}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
