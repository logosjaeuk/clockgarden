/** A stylized local day, not an astronomical sunrise or moon-phase calculation. */
export function livingTime(date: Date) {
  const second = date.getSeconds() + date.getMilliseconds() / 1000;
  const minute = date.getMinutes() + second / 60;
  const hour = date.getHours() + minute / 60;
  const daylight = Math.max(0, Math.min(1, (Math.sin(((hour - 6) / 12) * Math.PI) + 0.15) / 0.6));
  return {
    hour,
    minute,
    second,
    lanterns: date.getMinutes(),
    boat: second / 60,
    daylight,
    phase:
      hour < 5 ? 'night' : hour < 8 ? 'dawn' : hour < 17 ? 'day' : hour < 20 ? 'dusk' : 'night',
    hourTurn: date.getMinutes() === 0 && second < 5,
  } as const;
}
