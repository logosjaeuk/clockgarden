import { describe, expect, it } from 'vitest';
import { livingTime } from './living-time';

describe('Living Clock uses the actual local clock', () => {
  it('maps seconds to a single one-minute ferry circuit', () => {
    expect(livingTime(new Date(2026, 8, 5, 12, 17, 15)).boat).toBe(0.25);
    expect(livingTime(new Date(2026, 8, 5, 12, 17, 30)).boat).toBe(0.5);
    expect(livingTime(new Date(2026, 8, 5, 12, 17, 45)).boat).toBe(0.75);
  });
  it('lights one lantern per elapsed minute and resets at the hour', () => {
    const before = livingTime(new Date(2026, 8, 5, 23, 59, 59, 999));
    const after = livingTime(new Date(2026, 8, 6, 0, 0, 0));
    expect(before.lanterns).toBe(59);
    expect(before.boat).toBeCloseTo(1, 4);
    expect(after.lanterns).toBe(0);
    expect(after.boat).toBe(0);
    expect(after.hourTurn).toBe(true);
    expect(livingTime(new Date(2026, 8, 6, 0, 0, 5)).hourTurn).toBe(false);
  });
  it('follows local day phases independently of page loading or delayed frames', () => {
    expect(livingTime(new Date(2026, 8, 5, 6)).phase).toBe('dawn');
    expect(livingTime(new Date(2026, 8, 5, 12)).daylight).toBe(1);
    expect(livingTime(new Date(2026, 8, 5, 18)).phase).toBe('dusk');
    expect(livingTime(new Date(2026, 8, 5, 0)).daylight).toBe(0);
    expect(livingTime(new Date(2026, 8, 5, 23, 42, 30)).minute).toBe(42.5);
  });
});
