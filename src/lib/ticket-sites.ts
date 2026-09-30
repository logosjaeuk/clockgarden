export const ticketSites = [
  { id: 'nol', name: 'NOL 티켓', english: 'NOL Ticket', url: 'https://nol.yanolja.com/ticket' },
  { id: 'yes24', name: 'YES24 티켓', english: 'YES24 Ticket', url: 'https://ticket.yes24.com/' },
  { id: 'melon', name: '멜론티켓', english: 'Melon Ticket', url: 'https://ticket.melon.com/' },
  {
    id: 'ticketlink',
    name: '티켓링크',
    english: 'Ticketlink',
    url: 'https://www.ticketlink.co.kr/',
  },
] as const;

export type TicketSite = (typeof ticketSites)[number];
export const sampleLifetimeMs = 120_000;

export interface ServerTimeSample {
  site: string;
  sourceUrl: string;
  dateHeader: string;
  sampledAtMs: number;
  estimatedAtSampleMs: number;
  upstreamRttMs: number;
}

export interface ServerTimeReply extends ServerTimeSample {
  serverSentAtMs: number;
  processingMs: number;
}

export interface TimeAnchor {
  epochMs: number;
  monotonicMs: number;
  uncertaintyMs: number;
  sampleAgeMs: number;
}

export function timeAnchor(reply: ServerTimeReply, sent: number, received: number): TimeAnchor {
  const networkMs = Math.max(0, received - sent - reply.processingMs);
  return {
    epochMs: reply.estimatedAtSampleMs + (reply.serverSentAtMs - reply.sampledAtMs) + networkMs / 2,
    monotonicMs: received,
    // Date has whole-second resolution. Network asymmetry and unknown server clock errors remain.
    uncertaintyMs: 1_000 + (reply.upstreamRttMs + networkMs) / 2,
    sampleAgeMs: Math.max(0, reply.serverSentAtMs - reply.sampledAtMs) + networkMs / 2,
  };
}

export function validTimeReply(value: unknown, site: string): value is ServerTimeReply {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  const provider = ticketSites.find((item) => item.id === site);
  return (
    !!provider &&
    r.site === site &&
    r.sourceUrl === provider.url &&
    typeof r.dateHeader === 'string' &&
    Number.isFinite(Date.parse(r.dateHeader)) &&
    ['sampledAtMs', 'estimatedAtSampleMs', 'serverSentAtMs', 'upstreamRttMs', 'processingMs'].every(
      (key) => typeof r[key] === 'number' && Number.isFinite(r[key]),
    ) &&
    (r.upstreamRttMs as number) >= 0 &&
    (r.upstreamRttMs as number) < 15_000 &&
    (r.processingMs as number) >= 0 &&
    (r.processingMs as number) < 20_000 &&
    (r.serverSentAtMs as number) >= (r.sampledAtMs as number) &&
    (r.serverSentAtMs as number) - (r.sampledAtMs as number) < sampleLifetimeMs &&
    Math.abs((r.estimatedAtSampleMs as number) - Date.parse(r.dateHeader)) < 10_000
  );
}
