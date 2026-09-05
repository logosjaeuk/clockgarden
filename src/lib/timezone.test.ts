import { describe, expect, it } from 'vitest';
import {
  dateKey,
  getZonedParts,
  zoneOffsetMs,
  zonedDateTimeToUtc,
  possibleInstants,
} from './timezone';

describe('timezone conversion', () => {
  it('rejects a nonexistent New York spring-forward time', () => {
    expect(
      possibleInstants(
        { year: 2026, month: 3, day: 8, hour: 2, minute: 30, second: 0 },
        'America/New_York',
      ),
    ).toEqual([]);
  });
  it('returns both fall-back occurrences in chronological order', () => {
    expect(
      possibleInstants(
        { year: 2026, month: 11, day: 1, hour: 1, minute: 30, second: 0 },
        'America/New_York',
      ).map((d) => d.toISOString()),
    ).toEqual(['2026-11-01T05:30:00.000Z', '2026-11-01T06:30:00.000Z']);
  });
  it('handles Lord Howe half-hour DST and Samoa skipped date', () => {
    const fold = possibleInstants(
      { year: 2026, month: 4, day: 5, hour: 1, minute: 45, second: 0 },
      'Australia/Lord_Howe',
    );
    expect(fold).toHaveLength(2);
    expect(fold[1]!.getTime() - fold[0]!.getTime()).toBe(1_800_000);
    expect(
      possibleInstants(
        { year: 2011, month: 12, day: 30, hour: 12, minute: 0, second: 0 },
        'Pacific/Apia',
      ),
    ).toEqual([]);
  });
  it('rejects invalid calendar dates and resolves quarter-hour wall times', () => {
    expect(
      possibleInstants({ year: 2026, month: 2, day: 30, hour: 12, minute: 0, second: 0 }, 'UTC'),
    ).toEqual([]);
    expect(
      possibleInstants(
        { year: 2026, month: 1, day: 15, hour: 5, minute: 45, second: 0 },
        'Asia/Kathmandu',
      )[0]?.toISOString(),
    ).toBe('2026-01-15T00:00:00.000Z');
  });
  it('converts local time to an instant and rolls dates across zones', () => {
    const instant = zonedDateTimeToUtc(
      { year: 2026, month: 9, day: 4, hour: 9, minute: 0, second: 0 },
      'Asia/Seoul',
    );
    expect(instant.toISOString()).toBe('2026-09-04T00:00:00.000Z');
    expect(dateKey(instant, 'America/Los_Angeles')).toBe('2026-09-03');
  });
  it('supports half-hour and quarter-hour offsets', () => {
    const instant = new Date('2026-01-15T00:00:00Z');
    expect(zoneOffsetMs(instant, 'Asia/Kolkata')).toBe(5.5 * 3_600_000);
    expect(zoneOffsetMs(instant, 'Asia/Kathmandu')).toBe(5.75 * 3_600_000);
  });
  it('applies daylight-saving transitions from IANA data', () => {
    const before = new Date('2026-03-08T06:59:00Z');
    const after = new Date('2026-03-08T07:01:00Z');
    expect(zoneOffsetMs(before, 'America/New_York')).toBe(-5 * 3_600_000);
    expect(zoneOffsetMs(after, 'America/New_York')).toBe(-4 * 3_600_000);
    expect(getZonedParts(after, 'America/New_York').hour).toBe(3);
  });
});
