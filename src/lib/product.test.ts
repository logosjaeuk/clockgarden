import { describe, it, expect } from 'vitest';
import { resolveZone } from './cities';
import { supportedTimeZones } from './timezone';
import { validateTimerSession, validatePresets } from './timer-session';

describe('return-visit data', () => {
  it('finds English/Korean city names and rejects ambiguous abbreviations', () => {
    const zones = supportedTimeZones();
    expect(resolveZone('서울', zones)).toBe('Asia/Seoul');
    expect(resolveZone('New York', zones)).toBe('America/New_York');
    expect(resolveZone('London', zones)).toBe('Europe/London');
    expect(resolveZone('CST', zones)).toBeNull();
    expect(resolveZone('garbage', zones)).toBeNull();
  });
  it('restores finite countdown deadlines and rejects corrupted storage', () => {
    const session = {
      initialMs: 300000,
      state: { remainingMs: 200000, targetAt: 1700000000000 },
      repeat: false,
    };
    expect(validateTimerSession(session)).toEqual(session);
    expect(validateTimerSession({ ...session, state: { remainingMs: -1 } })).toBeNull();
    expect(validateTimerSession({ ...session, initialMs: Infinity })).toBeNull();
    expect(validateTimerSession(null)).toBeNull();
    expect(validatePresets([{ label: 'Tea', milliseconds: 180000 }])).toHaveLength(1);
    expect(validatePresets([{ label: 'Tea', milliseconds: -1 }])).toBeNull();
  });
});
