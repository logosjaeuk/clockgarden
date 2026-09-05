import { describe, expect, it } from 'vitest';
import { nextAlarmOccurrence, isAlarmDue, snoozeAlarm, type Alarm } from './alarm';

const alarm: Alarm = {
  id: 'a',
  hour: 7,
  minute: 30,
  label: 'Morning',
  enabled: true,
  weekdays: [],
  sound: 'chime',
};

describe('alarm scheduling', () => {
  it('catches a due alarm after a delayed callback without ringing twice', () => {
    expect(isAlarmDue(alarm, new Date(2026, 8, 4, 7, 32), new Date(2026, 8, 4, 7, 29))).toBe(true);
    expect(isAlarmDue(alarm, new Date(2026, 8, 4, 7, 33), new Date(2026, 8, 4, 7, 32))).toBe(false);
  });
  it('chooses later today or tomorrow', () => {
    expect(nextAlarmOccurrence(alarm, new Date(2026, 8, 4, 7, 0))?.getDate()).toBe(4);
    expect(nextAlarmOccurrence(alarm, new Date(2026, 8, 4, 8, 0))?.getDate()).toBe(5);
  });
  it('honors weekday repetition', () => {
    const mondayOnly = { ...alarm, weekdays: [1] };
    const next = nextAlarmOccurrence(mondayOnly, new Date(2026, 8, 4, 8, 0));
    expect(next?.getDay()).toBe(1);
    expect(next?.getDate()).toBe(7);
  });
  it('prioritizes snooze time', () => {
    const now = new Date(2026, 8, 4, 8, 0).getTime();
    const snoozed = snoozeAlarm(alarm, now, 5);
    expect(nextAlarmOccurrence(snoozed, new Date(now))?.getTime()).toBe(now + 300_000);
  });
});
