import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const tools = ['clock', 'timer', 'stopwatch', 'alarm', 'world-clock', 'time-zone-converter'];
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const titles = new Set();
const expectedOrigin = process.env.PUBLIC_SITE_URL || 'https://clockgarden.com';
const adsenseSrc =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9708700594020227';
const contentPages = ['privacy', 'about', 'contact', 'terms'];
const articleSlugs = [
  'circadian-rhythms-and-screen-light',
  'browser-timer-drift-and-monotonic-clocks',
  'remote-teams-timezone-overlap',
  'neuroscience-of-the-pomodoro-technique',
  'leap-seconds-and-atomic-time',
  'behind-living-clock-crafting-digital-zen',
];
const insightRoutes = ['insights', ...articleSlugs.map((slug) => `insights/${slug}`)];

for (const locale of ['en', 'ko']) {
  for (const route of ['', ...tools, ...contentPages, ...insightRoutes]) {
    const path = (locale === 'en' ? '' : 'ko/') + (route ? `${route}/` : '');
    const html = readFileSync(join('dist', path, 'index.html'), 'utf8');
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, path + ' H1');
    assert.ok(html.includes(`lang="${locale}"`), path + ' language');
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert.ok(title && !titles.has(title), path + ' unique title');
    titles.add(title);
    assert.ok(title.includes('Clock Garden'), path + ' brand');
    assert.ok(!html.includes('Minute Glass'), path + ' no old brand');
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical && new URL(canonical).pathname === '/' + path, path + ' canonical');
    assert.equal(
      new URL(canonical).origin,
      new URL(expectedOrigin).origin,
      path + ' production origin',
    );
    assert.ok(sitemap.includes(canonical), path + ' sitemap');
    for (const lang of ['en', 'ko', 'x-default'])
      assert.ok(html.includes(`hreflang="${lang}"`), path + ' alternate');
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
    const adsense = (head.match(/<script\b[^>]*>/gi) ?? []).filter(
      (tag) => tag.match(/\ssrc\s*=\s*(["'])(.*?)\1/i)?.[2] === adsenseSrc,
    );
    assert.equal(adsense.length, 0, path + ' advertising disabled during review');
    assert.ok(head.includes('name="google-adsense-account"'), path + ' ownership metadata');
    assert.ok(!html.includes('data-ad-placement='), path + ' no visible ad placements');
    assert.ok(!html.includes('googletagmanager.com'), path + ' no vendor tracking');
    assert.ok(!html.includes('contact@clockgarden.com'), path + ' current contact address');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const raw = match[1].replaceAll('&amp;', '&');
      if (!raw.startsWith('/') || raw.startsWith('//')) continue;
      const link = new URL(raw, expectedOrigin);
      const destination = join(
        'dist',
        decodeURIComponent(link.pathname),
        link.pathname.endsWith('/') ? 'index.html' : '',
      );
      assert.ok(existsSync(destination), path + ' existing internal link: ' + raw);
    }
    if (tools.includes(route)) {
      const jsonScripts = [
        ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
      ].map((m) => JSON.parse(m[1]));
      const types = jsonScripts.map((s) => s['@type']);
      assert.ok(types.includes('WebApplication'), path + ' WebApplication schema');
      assert.ok(types.includes('FAQPage'), path + ' FAQPage schema');
    }
    if (articleSlugs.some((slug) => route === `insights/${slug}`)) {
      const jsonScripts = [
        ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
      ].map((m) => JSON.parse(m[1]));
      const types = jsonScripts.map((s) => s['@type']);
      assert.ok(types.includes('Article'), path + ' Article schema');
      const article = jsonScripts.find((s) => s['@type'] === 'Article');
      assert.equal(article.mainEntityOfPage, canonical, path + ' article canonical');
      assert.ok(article.dateModified >= article.datePublished, path + ' article dates');
      assert.ok(article.citation.length > 0, path + ' article references');
      assert.ok(html.includes('article-sources'), path + ' visible sources');
    }
  }
}
assert.ok(readFileSync('dist/404.html', 'utf8').includes('noindex,follow'));
assert.ok(!readFileSync('dist/404.html', 'utf8').includes(adsenseSrc), 'no ads on error page');
assert.ok(
  readFileSync('dist/ads.txt', 'utf8').includes('pub-9708700594020227'),
  'ownership ads.txt',
);
assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https?:\/\//);
const assets = readdirSync('dist/_assets')
  .filter((name) => /\.(js|css)$/.test(name))
  .map((name) => {
    const content = readFileSync(join('dist/_assets', name));
    return { name, bytes: content.length, gzipBytes: gzipSync(content).length };
  });
console.log(JSON.stringify({ pagesChecked: titles.size, assets }, null, 2));
