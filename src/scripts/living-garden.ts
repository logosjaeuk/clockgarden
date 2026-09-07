import type { SceneRenderer } from '../lib/scene-catalog';
import { gardenTime } from '../lib/chrono-garden';
import { livingTime } from '../lib/living-time';

const TAU = Math.PI * 2;
const random = (i: number) => {
  const n = Math.sin(i * 127.1 + 31.7) * 43758.5453;
  return n - Math.floor(n);
};
const stops = [
  [0, '#101d38', '#344c69', '#102f34'],
  [5, '#42466a', '#b688a1', '#30494b'],
  [8, '#87afba', '#ecd7b2', '#557464'],
  [15, '#79a6b9', '#d1deca', '#426d61'],
  [18, '#665c89', '#e3a387', '#405d59'],
  [21, '#142643', '#3e5977', '#123639'],
  [24, '#101d38', '#344c69', '#102f34'],
] as const;
function mix(a: string, b: string, t: number) {
  return (
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export const renderChronoGarden: SceneRenderer = ({
  context: c,
  width: w,
  height: h,
  ratio,
  date,
  reducedMotion,
}) => {
  const t = livingTime(date),
    time = gardenTime(date, reducedMotion);
  const motion = reducedMotion ? 0 : date.getTime() / 1000;
  const night = 1 - t.daylight;
  const index = Math.max(
    0,
    stops.findIndex((s, i) => i < stops.length - 1 && t.hour >= s[0] && t.hour < stops[i + 1]![0]),
  );
  const a = stops[index]!,
    b = stops[index + 1]!;
  const blend = (t.hour - a[0]) / (b[0] - a[0]);
  const sky = mix(a[1], b[1], blend),
    horizon = mix(a[2], b[2], blend),
    ground = mix(a[3], b[3], blend);
  const ellipse = (x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient) => {
    c.fillStyle = fill;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU);
    c.fill();
  };
  const glow = (x: number, y: number, radius: number, color: string) => {
    const g = c.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, '#baffd000');
    ellipse(x, y, radius, radius, g);
  };
  c.setTransform(ratio, 0, 0, ratio, 0, 0);
  const background = c.createLinearGradient(0, 0, 0, h);
  background.addColorStop(0, sky);
  background.addColorStop(0.43, horizon);
  background.addColorStop(0.56, ground);
  background.addColorStop(1, '#081c29');
  c.fillStyle = background;
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 48; i++) {
    c.globalAlpha = night * (0.25 + random(i + 80) * 0.5);
    ellipse(random(i) * w, random(i + 50) * h * 0.38, 0.7, 0.7, '#eff5e7');
  }
  c.globalAlpha = 1;
  const orbX = w * 0.77,
    orbY = h * 0.18;
  glow(orbX, orbY, 62, night > 0.5 ? '#e7eaff25' : '#ffe8b733');
  ellipse(
    orbX,
    orbY,
    Math.min(22, w * 0.035),
    Math.min(22, w * 0.035),
    mix('#ffebbd', '#eeeaf0', night),
  );
  // Layered garden walls and distant hills frame an open, quiet center.
  for (let layer = 0; layer < 3; layer++) {
    c.fillStyle = mix(horizon, '#122e3b', 0.45 + layer * 0.16);
    c.beginPath();
    c.moveTo(0, h);
    for (let i = 0; i <= 18; i++) {
      const x = (i / 18) * w;
      const y =
        h * (0.36 + layer * 0.045) -
        Math.pow(Math.abs(i / 9 - 1), 1.5) * h * 0.13 -
        random(i + layer * 30) * h * 0.022;
      c.lineTo(x, y);
    }
    c.lineTo(w, h);
    c.closePath();
    c.fill();
  }
  const mobile = w < 600;
  const top = h < 500 ? 155 : 220;
  const bottom = mobile ? 175 : 140;
  const available = Math.max(100, h - top - bottom);
  const scale = Math.min(w / 950, available / 340);
  const cx = w / 2,
    cy = top + available * 0.56;
  c.save();
  c.translate(cx, cy);
  c.scale(scale, scale);
  ellipse(0, 26, 438, 173, '#061b2480');
  ellipse(0, 6, 425, 155, '#294b40');
  ellipse(0, 0, 425, 157, mix('#5f7955', '#315954', night));
  ellipse(0, 0, 410, 145, mix('#65735a', '#2b4743', night));
  // Loose grasses break the circular retaining edge into a planted border.
  for (let i = 0; i < 260; i++) {
    const angle = random(i + 1000) * TAU;
    const radius = 407 + random(i + 1100) * 28;
    const x = Math.cos(angle) * radius,
      y = Math.sin(angle) * radius * 0.36;
    c.strokeStyle = i % 3 ? mix('#57794f', '#2d5b4d', night) : mix('#8aa277', '#46776a', night);
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x - 4, y - 8, x + (random(i) - 0.5) * 11, y - 6 - random(i + 90) * 13);
    c.stroke();
  }
  // Twenty-four planted wedges, with a single luminous hour sector.
  for (let sector = 0; sector < 24; sector++) {
    const start = (sector / 24) * TAU - Math.PI / 2,
      end = ((sector + 1) / 24) * TAU - Math.PI / 2;
    const active = sector === time.sector;
    c.beginPath();
    c.ellipse(0, 0, 399, 139, 0, start + 0.012, end - 0.012);
    c.ellipse(0, 0, 297, 99, 0, end - 0.012, start + 0.012, true);
    c.closePath();
    c.fillStyle = active ? mix('#a6b985', '#4b9691', night) : mix('#486953', '#193d3d', night);
    c.fill();
    const mid = (start + end) / 2;
    if (active) glow(Math.cos(mid) * 346, Math.sin(mid) * 119, 64, '#b4f6b85c');
    for (let j = 0; j < 24; j++) {
      const angle = start + 0.03 + random(sector * 17 + j) * (end - start - 0.06);
      const radius = 306 + random(sector * 41 + j) * 81;
      const x = Math.cos(angle) * radius,
        y = Math.sin(angle) * radius * 0.345;
      const size = active ? 5 + random(j) * 2 : 3.5;
      c.strokeStyle = active ? '#9cc6a0' : '#456e5b';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y + 5);
      c.lineTo(x, y - 3);
      c.stroke();
      const hue = (time.flowerHour * 37 + j * 8 + 170) % 360;
      const color = active
        ? `hsl(${hue} 55% ${74 + night * 8}%)`
        : `hsl(${hue} 18% ${35 + t.daylight * 12}%)`;
      for (let p = 0; p < 4; p++)
        ellipse(
          x + Math.cos((p * TAU) / 4) * size * 0.7,
          y - 4 + Math.sin((p * TAU) / 4) * size * 0.45,
          size * 0.65,
          size * 0.45,
          color,
        );
      ellipse(x, y - 4, 1.2, 1, active ? '#fff4b8' : '#68836a');
    }
    // Hour markers are quiet stones, not a second numeric clock face.
    const sx = Math.cos(mid) * 418,
      sy = Math.sin(mid) * 151;
    ellipse(sx, sy, active ? 4 : 2, active ? 2.5 : 1.5, active ? '#e3ffc3' : '#78948b');
  }
  ellipse(0, 0, 281, 92, mix('#557b65', '#224d49', night));
  ellipse(0, 0, 266, 83, mix('#547362', '#153e3e', night));
  for (let i = 0; i < 85; i++) {
    const angle = random(i + 501) * TAU,
      radius = 105 + random(i + 620) * 154;
    ellipse(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.3,
      2 + random(i) * 3,
      0.8,
      '#7caa872b',
    );
  }
  const orbitY = -15,
    fireX = Math.cos(time.orbitAngle) * 184,
    fireY = orbitY + Math.sin(time.orbitAngle) * 65;
  c.strokeStyle = '#b5e6bd24';
  c.lineWidth = 0.8;
  c.beginPath();
  c.ellipse(0, orbitY, 184, 65, 0, 0, TAU);
  c.stroke();
  function firefly() {
    glow(fireX, fireY, 24, '#eeffc880');
    ellipse(fireX, fireY, 3.8, 3.8, '#f4ffd6');
    if (!reducedMotion) {
      ellipse(fireX - 4, fireY - 2, 3, 1.5, '#e5ffc77a');
      ellipse(fireX + 4, fireY - 2, 3, 1.5, '#e5ffc77a');
    }
  }
  if (Math.sin(time.orbitAngle) < 0) firefly();
  // A single sculptural flower: layered petals unfurl through exactly 60 states.
  glow(0, -17, 144, '#7bdccf25');
  c.save();
  c.translate(0, -16);
  for (let i = 0; i < 7; i++) {
    c.save();
    c.rotate((i * TAU) / 7);
    c.scale(1, 0.5);
    c.fillStyle = i % 2 ? '#367766' : '#2b6057';
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-45, -36, -63, -62, -13, -87);
    c.bezierCurveTo(14, -58, 24, -17, 0, 0);
    c.fill();
    c.restore();
  }
  const bloom = time.bloom,
    hue = [330, 275, 205, 35, 355, 255][time.flowerHour % 6]!;
  for (let ring = 2; ring >= 0; ring--) {
    for (let p = 0; p < 9; p++) {
      c.save();
      c.scale(1, 0.68);
      c.rotate((p * TAU) / 9 + ring * 0.27);
      const length = 13 + bloom * (46 + ring * 22),
        spread = 4 + bloom * (13 + ring * 6);
      const petal = c.createLinearGradient(0, 0, 0, -length);
      petal.addColorStop(0, `hsl(${hue + 14} 40% ${37 + ring * 4}%)`);
      petal.addColorStop(0.6, `hsl(${hue} 58% ${65 + ring * 5}%)`);
      petal.addColorStop(1, `hsl(${hue - 9} 66% 89%)`);
      c.fillStyle = petal;
      c.beginPath();
      c.moveTo(0, 5);
      c.bezierCurveTo(-spread, -length * 0.25, -spread, -length * 0.76, 0, -length);
      c.bezierCurveTo(spread, -length * 0.76, spread, -length * 0.25, 0, 5);
      c.fill();
      c.strokeStyle = '#fff1df26';
      c.lineWidth = 0.65;
      c.stroke();
      c.restore();
    }
  }
  if (bloom < 0.2) {
    const budHeight = 27 * (1 - bloom / 0.2);
    ellipse(0, -budHeight * 0.5, 10, Math.max(3, budHeight), `hsl(${hue} 46% 77%)`);
    c.strokeStyle = '#f4ffe75c';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -budHeight * 1.45);
    c.quadraticCurveTo(5, -budHeight * 0.6, 0, 5);
    c.stroke();
  }
  ellipse(0, 0, 4 + bloom * 9, 3 + bloom * 6, '#f2d89c');
  for (let i = 0; i < 12; i++)
    ellipse(
      Math.cos((i * TAU) / 12) * bloom * 8,
      Math.sin((i * TAU) / 12) * bloom * 5,
      0.9,
      0.9,
      '#fff3c7',
    );
  c.restore();
  if (Math.sin(time.orbitAngle) >= 0) firefly();
  // Fog and decorative fireflies change smoothly with the day's light.
  for (let i = 0; i < 3; i++) {
    const drift = Math.sin(motion * 0.045 + i) * 35;
    const mist = c.createRadialGradient(drift, 34 + i * 23, 0, drift, 34 + i * 23, 330);
    mist.addColorStop(0, `rgba(162, 211, 194, ${0.015 + night * 0.025})`);
    mist.addColorStop(1, '#c7eee000');
    ellipse(drift, 34 + i * 23, 360, 16, mist);
  }
  for (let i = 0; i < 30; i++) {
    const alpha = Math.max(0, Math.min(1, night * 1.4 - i / 30));
    if (!alpha) continue;
    const x = (random(i + 900) - 0.5) * 820 + Math.sin(motion * 0.13 + i) * 7;
    const y = (random(i + 920) - 0.5) * 270 + Math.cos(motion * 0.17 + i) * 5;
    c.globalAlpha = alpha * 0.45;
    glow(x, y, 6, '#b7efbc66');
    ellipse(x, y, 1.2, 1.2, '#d9f3bc');
  }
  c.globalAlpha = 1;
  c.restore();
  // Soft foreground foliage echoes the reference's framing without covering controls.
  for (const side of [0, 1]) {
    c.save();
    c.translate(side * w, h * 0.83);
    c.scale(side ? -1 : 1, 1);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = i % 2 ? '#102e35' : '#0b2530';
      c.beginPath();
      c.moveTo(-10, 100);
      c.quadraticCurveTo(5 + i * 9, -25 - i * 12, 27 + i * 13, -42 - i * 10);
      c.quadraticCurveTo(18 + i * 12, 30, -10, 100);
      c.fill();
    }
    c.restore();
  }
  const veil = c.createLinearGradient(0, 0, 0, h);
  veil.addColorStop(0, '#07162666');
  veil.addColorStop(0.32, '#07162600');
  veil.addColorStop(0.7, '#07162600');
  veil.addColorStop(1, '#071626aa');
  c.fillStyle = veil;
  c.fillRect(0, 0, w, h);
};
