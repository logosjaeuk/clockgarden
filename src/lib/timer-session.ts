import type { TimerState } from './time';

export const MAX_TIMER_MS = 3_599_999_000;
export interface TimerSession {
  initialMs: number;
  state: TimerState;
  repeat: boolean;
}
export function validateTimerSession(value: unknown): TimerSession | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as TimerSession;
  const validDuration = (n: number) => Number.isFinite(n) && n >= 0 && n <= MAX_TIMER_MS;
  return validDuration(v.initialMs) &&
    v.state &&
    validDuration(v.state.remainingMs) &&
    (v.state.targetAt === null ||
      (Number.isFinite(v.state.targetAt) && v.state.targetAt > 0 && v.state.targetAt < 8.64e15)) &&
    typeof v.repeat === 'boolean'
    ? v
    : null;
}

export interface TimerPreset {
  label: string;
  milliseconds: number;
}
export function validatePresets(value: unknown): TimerPreset[] | null {
  return Array.isArray(value) &&
    value.length <= 8 &&
    value.every(
      (v) =>
        v &&
        typeof v.label === 'string' &&
        v.label.length <= 40 &&
        Number.isFinite(v.milliseconds) &&
        v.milliseconds > 0 &&
        v.milliseconds <= MAX_TIMER_MS,
    )
    ? value
    : null;
}
