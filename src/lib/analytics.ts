import { siteConfig } from '../config';

export type EventName =
  | 'tool_open'
  | 'fullscreen_enter'
  | 'stopwatch_start'
  | 'timer_start'
  | 'alarm_created'
  | 'world_clock_added'
  | 'timezone_conversion';

export function track(name: EventName): void {
  if (!siteConfig.analyticsEndpoint) return;
  const body = JSON.stringify({ name, path: location.pathname, timestamp: Date.now() });
  navigator.sendBeacon?.(siteConfig.analyticsEndpoint, body);
}
