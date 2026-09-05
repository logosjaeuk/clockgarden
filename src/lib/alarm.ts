export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  weekdays: number[];
  sound: 'chime' | 'pulse' | 'bright';
  snoozedUntil?: number;
}

export function nextAlarmOccurrence(alarm: Alarm, from: Date): Date | null {
  if (!alarm.enabled) return null;
  if (alarm.snoozedUntil && alarm.snoozedUntil > from.getTime())
    return new Date(alarm.snoozedUntil);
  for (let addDays = 0; addDays <= 7; addDays += 1) {
    const candidate = new Date(from);
    candidate.setSeconds(0, 0);
    candidate.setDate(candidate.getDate() + addDays);
    candidate.setHours(alarm.hour, alarm.minute, 0, 0);
    const allowed = alarm.weekdays.length === 0 || alarm.weekdays.includes(candidate.getDay());
    if (allowed && candidate.getTime() > from.getTime()) return candidate;
  }
  return null;
}

export function nextAlarm(alarms: Alarm[], from: Date): { alarm: Alarm; at: Date } | null {
  return alarms.reduce<{ alarm: Alarm; at: Date } | null>((nearest, alarm) => {
    const at = nextAlarmOccurrence(alarm, from);
    return at && (!nearest || at < nearest.at) ? { alarm, at } : nearest;
  }, null);
}

export function snoozeAlarm(alarm: Alarm, now: number, minutes = 5): Alarm {
  return { ...alarm, enabled: true, snoozedUntil: now + minutes * 60_000 };
}

export function isAlarmDue(alarm: Alarm, now: Date, previousCheck: Date): boolean {
  if (!alarm.enabled) return false;
  if (alarm.snoozedUntil)
    return alarm.snoozedUntil > previousCheck.getTime() && alarm.snoozedUntil <= now.getTime();
  const scheduled = nextAlarmOccurrence(alarm, previousCheck);
  return scheduled !== null && scheduled <= now;
}
