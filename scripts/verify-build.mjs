import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const tools = ['clock', 'timer', 'stopwatch', 'alarm', 'world-clock', 'time-zone-converter'];
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const titles = new Set();
const expectedOrigin = process.env.PUBLIC_SITE_URL || 'https://clockgarden.com';
for (const locale of ['en', 'ko']) {
  for (const route of ['', ...tools, 'privacy']) {
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
    assert.ok(
      !html.includes('adsbygoogle') && !html.includes('data-ad-placement='),
      path + ' ads disabled',
    );
    assert.ok(!html.includes('googletagmanager.com'), path + ' no vendor tracking');
    if (tools.includes(route)) {
      const json = html.match(/type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
      assert.equal(JSON.parse(json)['@type'], 'WebApplication');
    }
  }
}
assert.ok(readFileSync('dist/404.html', 'utf8').includes('noindex,follow'));
assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https?:\/\//);
const assets = readdirSync('dist/_assets')
  .filter((name) => /\.(js|css)$/.test(name))
  .map((name) => {
    const content = readFileSync(join('dist/_assets', name));
    return { name, bytes: content.length, gzipBytes: gzipSync(content).length };
  });
console.log(JSON.stringify({ pagesChecked: titles.size, assets }, null, 2));
