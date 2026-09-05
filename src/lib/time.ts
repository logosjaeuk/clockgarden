import { dateFormatter } from './intl';

export interface ClockOptions {
  locale: string;
  hour12: boolean;
  timeZone?: string;
  seconds?: boolean;
}

export function formatClock(date: Date, options: ClockOptions): string {
  return dateFormatter(options.locale, {
    timeZone: options.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: options.seconds === false ? undefined : '2-digit',
    hour12: options.hour12,
  }).format(date);
}

export function formatDate(date: Date, locale: string, timeZone?: string): string {
  return dateFormatter(locale, {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDuration(ms: number, showMillis = true): string {
  const safe = Math.max(0, Math.floor(ms));
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const millis = safe % 1_000;
  const base = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return showMillis ? `${base}.${String(millis).padStart(3, '0')}` : base;
}

export function utcOffsetLabel(date: Date, timeZone: string): string {
  const parts = dateFormatter('en', {
    timeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  return parts.find((part) => part.type === 'timeZoneName')?.value.replace('GMT', 'UTC') ?? 'UTC';
}

export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export interface StopwatchState {
  accumulatedMs: number;
  startedAt: number | null;
}

export function stopwatchElapsed(state: StopwatchState, monotonicNow: number): number {
  return state.accumulatedMs + (state.startedAt === null ? 0 : monotonicNow - state.startedAt);
}

export function pauseStopwatch(state: StopwatchState, monotonicNow: number): StopwatchState {
  return { accumulatedMs: stopwatchElapsed(state, monotonicNow), startedAt: null };
}

export interface LapStats {
  best: number;
  slowest: number;
  average: number;
}

export function lapStats(laps: number[]): LapStats | null {
  if (!laps.length) return null;
  return {
    best: Math.min(...laps),
    slowest: Math.max(...laps),
    average: laps.reduce((sum, lap) => sum + lap, 0) / laps.length,
  };
}

export interface TimerState {
  remainingMs: number;
  targetAt: number | null;
}

export function timerRemaining(state: TimerState, wallNow: number): number {
  return Math.max(0, state.targetAt === null ? state.remainingMs : state.targetAt - wallNow);
}

export function startTimer(remainingMs: number, wallNow: number): TimerState {
  return { remainingMs: Math.max(0, remainingMs), targetAt: wallNow + Math.max(0, remainingMs) };
}

export function pauseTimer(state: TimerState, wallNow: number): TimerState {
  return { remainingMs: timerRemaining(state, wallNow), targetAt: null };
}

export function addTimerTime(state: TimerState, addedMs: number): TimerState {
  return state.targetAt === null
    ? { ...state, remainingMs: Math.max(0, state.remainingMs + addedMs) }
    : { ...state, targetAt: state.targetAt + addedMs };
}
