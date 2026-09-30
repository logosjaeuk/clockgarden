import { ticketSites, type ServerTimeSample } from '../../src/lib/ticket-sites';
import { readServerTime, TimeSourceError } from '../../src/lib/server-time-source';

interface Context {
  request: Request;
  waitUntil(promise: Promise<unknown>): void;
}
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

export async function onRequest(context: Context): Promise<Response> {
  if (context.request.method !== 'GET') return json({ error: 'method' }, 405);
  const url = new URL(context.request.url);
  const site = ticketSites.find((item) => item.id === url.searchParams.get('site'));
  if (
    !site ||
    url.searchParams.getAll('site').length !== 1 ||
    [...url.searchParams.keys()].some((key) => key !== 'site')
  )
    return json({ error: 'site' }, 400);
  const start = performance.now();
  // Share a measured sample for ten seconds within the edge location. Advance from its timestamp.
  // No account, cookie, visitor IP, or arbitrary destination is stored in this cache.
  const cache = (caches as CacheStorage & { default?: Cache }).default;
  const key = new Request(`https://clockgarden.com/__time-samples/v1/${site.id}`);
  let sample: ServerTimeSample | undefined;
  try {
    const stored = await cache?.match(key);
    if (stored) {
      const candidate = (await stored.json()) as ServerTimeSample;
      const age = Date.now() - candidate.sampledAtMs;
      if (candidate.site === site.id && age >= 0 && age < 10_000) sample = candidate;
    }
  } catch {
    /* A cache miss or failure must not prevent a fresh measurement. */
  }
  try {
    if (!sample) {
      sample = await readServerTime(site);
      if (cache) {
        const stored = new Response(JSON.stringify(sample), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=10' },
        });
        context.waitUntil(cache.put(key, stored).catch(() => {}));
      }
    }
    return json({ ...sample, serverSentAtMs: Date.now(), processingMs: performance.now() - start });
  } catch (error) {
    const failure = error instanceof TimeSourceError ? error : new TimeSourceError('network');
    return json(
      { site: site.id, error: failure.code, upstreamStatus: failure.upstreamStatus },
      502,
    );
  }
}
