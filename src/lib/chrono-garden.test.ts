import { describe, expect, it } from 'vitest';
import { gardenTime } from './chrono-garden';

describe('Chrono Garden real-time semantics', () => {
  it('has 24 hour sectors and exactly 60 ordered bloom states', () => {
    for (let hour = 0; hour < 24; hour++) {
      const blooms = Array.from({ length: 60 }, (_, minute) =>
        gardenTime(new Date(2026, 8, 7, hour, minute, 10)),
      );
      expect(blooms.every((v) => v.sector === hour)).toBe(true);
      expect(new Set(blooms.map((v) => v.bloom)).size).toBe(60);
      expect(blooms[0]!.bloom).toBe(0);
      expect(blooms[59]!.bloom).toBe(1);
      expect(blooms.map((v) => v.bloom)).toEqual(blooms.map((v) => v.bloom).sort((a, b) => a - b));
    }
  });
  it('closes the old flower before changing color, including midnight', () => {
    const start = gardenTime(new Date(2026, 8, 7, 0, 0, 0));
    const middle = gardenTime(new Date(2026, 8, 7, 0, 0, 0, 750));
    const end = gardenTime(new Date(2026, 8, 7, 0, 0, 1, 500));
    expect(start).toMatchObject({ bloom: 1, closing: true, flowerHour: 23, sector: 0 });
    expect(middle.bloom).toBeCloseTo(0.5);
    expect(end).toMatchObject({ bloom: 0, closing: false, flowerHour: 0 });
  });
  it('makes one continuous orbit per minute without accumulated frame state', () => {
    const angle = (seconds: number) => gardenTime(new Date(2026, 8, 7, 12, 34, seconds)).orbitAngle;
    expect(angle(15) - angle(0)).toBeCloseTo(Math.PI / 2);
    expect(angle(45) - angle(15)).toBeCloseTo(Math.PI);
    expect(angle(60)).toBe(angle(0));
    expect(gardenTime(new Date(2026, 8, 7, 12, 34, 45))).toEqual(
      gardenTime(new Date(2026, 8, 7, 12, 34, 45)),
    );
  });
  it('keeps time accurate while suppressing the closing animation in reduced motion', () => {
    expect(gardenTime(new Date(2026, 8, 7, 6, 0, 0), true)).toMatchObject({
      bloom: 0,
      closing: false,
      flowerHour: 6,
    });
    expect(gardenTime(new Date(2026, 8, 7, 18, 59, 30), true).bloom).toBe(1);
  });
});
