const TAU = Math.PI * 2;
export function gardenTime(date: Date, reducedMotion = false) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds() + date.getMilliseconds() / 1000;
  const closing = minute === 0 && second < 1.5 && !reducedMotion;
  const progress = Math.min(1, second / 1.5);
  return {
    sector: hour,
    minute,
    // 60 distinct minute states. The first 1.5 seconds close the previous flower.
    bloom: closing ? 1 - progress * progress * (3 - 2 * progress) : minute / 59,
    closing,
    flowerHour: closing ? (hour + 23) % 24 : hour,
    orbitAngle: (second / 60) * TAU - Math.PI / 2,
  };
}
