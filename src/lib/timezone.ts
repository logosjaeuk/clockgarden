import { dateFormatter } from './intl';

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export const fallbackTimeZones = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Kathmandu',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Adelaide',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

export function supportedTimeZones(): string[] {
  try {
    const values = (
      Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf?.('timeZone');
    return values?.length ? ['UTC', ...values] : [...fallbackTimeZones];
  } catch {
    return [...fallbackTimeZones];
  }
}

export function zoneLabel(zone: string): string {
  return zone === 'UTC' ? 'UTC' : zone.replaceAll('_', ' ').replace('/', ' · ');
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  let formatter = partFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    partFormatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

const partFormatters = new Map<string, Intl.DateTimeFormat>();

/** All real instants for a wall time: zero in a gap, two in a DST fold. */
export function possibleInstants(parts: ZonedParts, timeZone: string): Date[] {
  const desired = partsAsUtc(parts);
  if (!Number.isFinite(desired) || parts.year < 100 || parts.year > 9999) return [];
  const offsets = new Set<number>();
  // Sample both sides, including half-hour DST and international date-line changes.
  for (let hours = -48; hours <= 48; hours += 6) {
    offsets.add(zoneOffsetMs(new Date(desired + hours * 3_600_000), timeZone));
  }
  return [...offsets]
    .map((offset) => new Date(desired - offset))
    .filter((date) => {
      const actual = getZonedParts(date, timeZone);
      return (Object.keys(parts) as Array<keyof ZonedParts>).every(
        (key) => actual[key] === parts[key],
      );
    })
    .sort((a, b) => a.getTime() - b.getTime());
}

function partsAsUtc(parts: ZonedParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

export function zoneOffsetMs(date: Date, timeZone: string): number {
  return partsAsUtc(getZonedParts(date, timeZone)) - Math.floor(date.getTime() / 1000) * 1000;
}

export function zonedDateTimeToUtc(parts: ZonedParts, timeZone: string): Date {
  const desired = partsAsUtc(parts);
  let candidate = desired;
  for (let i = 0; i < 4; i += 1) {
    const offset = zoneOffsetMs(new Date(candidate), timeZone);
    const next = desired - offset;
    if (next === candidate) break;
    candidate = next;
  }
  return new Date(candidate);
}

export function formatInZone(date: Date, timeZone: string, locale: string) {
  return dateFormatter(locale, {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function timeZoneName(date: Date, timeZone: string, locale: string): string {
  return (
    dateFormatter(locale, { timeZone, timeZoneName: 'short' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? timeZone
  );
}

export function dateKey(date: Date, timeZone: string): string {
  const p = getZonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
