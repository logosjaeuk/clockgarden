import type { ServerTimeSample, TicketSite } from './ticket-sites';

export class TimeSourceError extends Error {
  constructor(
    public code: string,
    public upstreamStatus?: number,
  ) {
    super(code);
  }
}

export async function readServerTime(
  site: TicketSite,
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now,
  monotonic: () => number = () => performance.now(),
): Promise<ServerTimeSample> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    let method = 'HEAD';
    let url = site.url as string;
    for (let attempt = 0; attempt < 4; attempt++) {
      const start = monotonic();
      const response = await fetcher(url, {
        method,
        redirect: 'manual',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache', Accept: 'text/html' },
      });
      const upstreamRttMs = Math.max(0, monotonic() - start);
      const sampledAtMs = now();
      await response.body?.cancel();
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('Location');
        if (!location) throw new TimeSourceError('redirect');
        const destination = new URL(location, url);
        // Fixed providers only; never proxy user URLs or follow redirects to unrelated hosts.
        if (
          destination.origin !== new URL(site.url).origin ||
          destination.username ||
          destination.password
        )
          throw new TimeSourceError('redirect');
        url = destination.href;
        continue;
      }
      if (method === 'HEAD' && [405, 501].includes(response.status)) {
        method = 'GET';
        continue;
      }
      if (!response.ok) throw new TimeSourceError('upstream', response.status);
      const dateHeader = response.headers.get('Date');
      const dateMs = dateHeader ? Date.parse(dateHeader) : NaN;
      if (!dateHeader || !Number.isFinite(dateMs)) throw new TimeSourceError('missing-date');
      const age = response.headers.get('Age');
      const cacheStatus = [
        response.headers.get('CF-Cache-Status'),
        response.headers.get('X-Cache'),
      ].join(' ');
      if (
        (age !== null && (!Number.isFinite(Number(age)) || Number(age) > 0)) ||
        /\b(?:HIT|STALE)\b/i.test(cacheStatus)
      )
        throw new TimeSourceError('cached-response');
      if (Math.abs(dateMs - sampledAtMs) > 300_000) throw new TimeSourceError('stale-date');
      return {
        site: site.id,
        sourceUrl: site.url,
        dateHeader,
        sampledAtMs,
        upstreamRttMs,
        estimatedAtSampleMs: dateMs + 500 + upstreamRttMs / 2,
      };
    }
    throw new TimeSourceError('redirect');
  } catch (error) {
    if (error instanceof TimeSourceError) throw error;
    throw new TimeSourceError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timeout);
  }
}
