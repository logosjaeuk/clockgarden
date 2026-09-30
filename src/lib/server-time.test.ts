import { afterEach, describe, expect, it, vi } from 'vitest';
import { readServerTime } from './server-time-source';
import { ticketSites, timeAnchor, validTimeReply } from './ticket-sites';
import { onRequest } from '../../functions/api/server-time';

const site = ticketSites[1];
const epoch = Date.parse('Wed, 30 Sep 2026 12:00:00 GMT');
const date = 'Wed, 30 Sep 2026 12:00:00 GMT';
const response = (headers: Record<string, string> = {}, status = 200) =>
  new Response(null, { status, headers: { Date: date, ...headers } });
const read = (fetcher: ReturnType<typeof vi.fn>, timestamp = epoch + 200) => {
  let tick = 0;
  return readServerTime(
    site,
    fetcher,
    () => timestamp,
    () => (tick += 100),
  );
};
const request = (query: string, method = 'GET') => ({
  request: new Request(`https://clockgarden.com/api/server-time${query}`, { method }),
  waitUntil: vi.fn(),
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ticket website response source', () => {
  it('reads only the selected public endpoint without visitor credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue(response());
    const sample = await read(fetcher);
    expect(sample.estimatedAtSampleMs).toBe(epoch + 550);
    expect(sample.upstreamRttMs).toBe(100);
    expect(fetcher.mock.calls[0]?.[0]).toBe(site.url);
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store',
    });
    expect(fetcher.mock.calls[0]?.[1].headers).not.toHaveProperty('Cookie');
  });
  it.each([403, 429, 500])('rejects HTTP %i rather than showing its Date', async (status) => {
    await expect(read(vi.fn().mockResolvedValue(response({}, status)))).rejects.toMatchObject({
      code: 'upstream',
      upstreamStatus: status,
    });
  });
  it.each([
    { Age: '30' },
    { Age: 'invalid' },
    { 'X-Cache': 'Hit from cloudfront' },
    { 'CF-Cache-Status': 'STALE' },
  ])('rejects a cached response %j', async (headers) => {
    await expect(read(vi.fn().mockResolvedValue(response(headers)))).rejects.toMatchObject({
      code: 'cached-response',
    });
  });
  it('rejects missing and stale timestamps', async () => {
    await expect(read(vi.fn().mockResolvedValue(new Response(null)))).rejects.toMatchObject({
      code: 'missing-date',
    });
    await expect(
      read(vi.fn().mockResolvedValue(response()), epoch + 600_000),
    ).rejects.toMatchObject({ code: 'stale-date' });
  });
  it('does not follow a redirect to a private or unrelated host', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(response({ Location: 'http://127.0.0.1/secret' }, 302));
    await expect(read(fetcher)).rejects.toMatchObject({ code: 'redirect' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('allows a redirect within the same provider', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({ Location: '/Main' }, 302))
      .mockResolvedValueOnce(response());
    expect((await read(fetcher)).sourceUrl).toBe(site.url);
    expect(fetcher.mock.calls[1]?.[0]).toBe(new URL('/Main', site.url).href);
  });
  it('uses GET only when HEAD is unsupported and releases the response body', async () => {
    const body = new ReadableStream({ cancel: vi.fn() });
    const cancel = vi.spyOn(body, 'cancel');
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({}, 405))
      .mockResolvedValueOnce(new Response(body, { headers: { Date: date } }));
    await read(fetcher);
    expect(fetcher.mock.calls[1]?.[1].method).toBe('GET');
    expect(cancel).toHaveBeenCalled();
  });
  it('reports a connection error without fabricating local server time', async () => {
    await expect(read(vi.fn().mockRejectedValue(new TypeError('network')))).rejects.toMatchObject({
      code: 'network',
    });
  });
});

describe('browser delay correction', () => {
  const sample = {
    site: site.id,
    sourceUrl: site.url,
    dateHeader: date,
    sampledAtMs: epoch + 1_000,
    estimatedAtSampleMs: epoch + 600,
    upstreamRttMs: 200,
    serverSentAtMs: epoch + 1_100,
    processingMs: 1_000,
  };
  it('subtracts backend processing time so upstream delay is not counted twice', () => {
    const anchor = timeAnchor(sample, 50, 1_250);
    expect(anchor.epochMs).toBe(epoch + 800);
    expect(anchor.uncertaintyMs).toBe(1_200);
    expect(anchor.monotonicMs).toBe(1_250);
  });
  it('advances cached samples from the measurement time', () => {
    const anchor = timeAnchor(
      { ...sample, serverSentAtMs: epoch + 9_000, processingMs: 10 },
      0,
      210,
    );
    expect(anchor.epochMs).toBe(epoch + 8_700);
    expect(anchor.sampleAgeMs).toBe(8_100);
  });
  it('rejects wrong providers, expired samples and invalid numeric data', () => {
    expect(validTimeReply(sample, site.id)).toBe(true);
    expect(validTimeReply(sample, 'melon')).toBe(false);
    expect(validTimeReply({ ...sample, serverSentAtMs: epoch + 180_000 }, site.id)).toBe(false);
    expect(validTimeReply({ ...sample, processingMs: -1 }, site.id)).toBe(false);
    expect(validTimeReply({ ...sample, estimatedAtSampleMs: Infinity }, site.id)).toBe(false);
  });
});

describe('same-origin time API', () => {
  it('rejects arbitrary URLs, unsupported sites and methods before making requests', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect((await onRequest(request('?site=http://127.0.0.1'))).status).toBe(400);
    expect((await onRequest(request('?site=yes24&url=http://127.0.0.1'))).status).toBe(400);
    expect((await onRequest(request('?site=yes24', 'POST'))).status).toBe(405);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('returns a structured upstream failure and forbids browser caching', async () => {
    vi.stubGlobal('caches', {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, 403)));
    const result = await onRequest(request('?site=yes24'));
    expect(result.status).toBe(502);
    expect(result.headers.get('Cache-Control')).toBe('no-store');
    expect(result.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(await result.json()).toMatchObject({ error: 'upstream', upstreamStatus: 403 });
  });
  it('shares a fresh sample without re-fetching and keeps its original timestamp', async () => {
    const now = Date.now();
    const sample = {
      site: site.id,
      sourceUrl: site.url,
      dateHeader: new Date(now).toUTCString(),
      sampledAtMs: now - 3_000,
      estimatedAtSampleMs: now - 2_500,
      upstreamRttMs: 100,
    };
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    vi.stubGlobal('caches', {
      default: { match: vi.fn().mockResolvedValue(new Response(JSON.stringify(sample))) },
    });
    const result = await onRequest(request('?site=yes24'));
    expect(result.status).toBe(200);
    expect((await result.json()).sampledAtMs).toBe(sample.sampledAtMs);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
