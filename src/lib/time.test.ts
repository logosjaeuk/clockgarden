import { describe, expect, it } from 'vitest';
import {
  addTimerTime,
  formatClock,
  formatDate,
  lapStats,
  pauseStopwatch,
  pauseTimer,
  startTimer,
  stopwatchElapsed,
  timerRemaining,
} from './time';

describe('clock formatting', () => {
  const instant = new Date('2026-09-04T13:05:09.000Z');
  it('formats 24-hour and 12-hour time', () => {
    expect(formatClock(instant, { locale: 'en-GB', hour12: false, timeZone: 'UTC' })).toBe(
      '13:05:09',
    );
    expect(formatClock(instant, { locale: 'en-US', hour12: true, timeZone: 'UTC' })).toMatch(
      /1:05:09\sPM/,
    );
  });
  it('handles date rollover and localized dates', () => {
    const rollover = new Date('2026-01-01T00:30:00Z');
    expect(formatDate(rollover, 'en-US', 'America/Los_Angeles')).toContain('December 31, 2025');
    expect(formatDate(instant, 'ko-KR', 'Asia/Seoul')).toContain('2026년');
  });
});

describe('stopwatch calculations', () => {
  it('calculates running and paused elapsed time', () => {
    const running = { accumulatedMs: 1_000, startedAt: 5_000 };
    expect(stopwatchElapsed(running, 7_250)).toBe(3_250);
    expect(pauseStopwatch(running, 7_250)).toEqual({ accumulatedMs: 3_250, startedAt: null });
  });
  it('calculates lap statistics', () => {
    expect(lapStats([1_000, 1_500, 2_000])).toEqual({
      best: 1_000,
      slowest: 2_000,
      average: 1_500,
    });
    expect(lapStats([])).toBeNull();
  });
});

describe('timer calculations', () => {
  it('uses a target timestamp and expires at zero', () => {
    const timer = startTimer(5_000, 10_000);
    expect(timerRemaining(timer, 12_000)).toBe(3_000);
    expect(timerRemaining(timer, 16_000)).toBe(0);
  });
  it('pauses, resumes, and adds time', () => {
    const paused = pauseTimer(startTimer(10_000, 1_000), 4_000);
    expect(paused).toEqual({ remainingMs: 7_000, targetAt: null });
    expect(addTimerTime(paused, 60_000).remainingMs).toBe(67_000);
    expect(addTimerTime(startTimer(1_000, 5_000), 2_000).targetAt).toBe(8_000);
  });
});
