import { livingTime } from '../lib/living-time';

// Pure frame renderer: the shared controller owns time, visibility and frame limits.
export function drawAquarium(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  now: Date,
  reduced: boolean,
) {
  const t = livingTime(now),
    tau = Math.PI * 2;
  const motion = reduced ? 0 : now.getTime() / 1000;
  const seed = (i: number) => (Math.sin(i * 127.1 + 42) * 43758.5453) % 1;
  const rand = (i: number) => Math.abs(seed(i));
  const oval = (x: number, y: number, rx: number, ry: number, color: string) => {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, tau);
    c.fill();
  };
  const glow = (x: number, y: number, r: number, color: string) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, '#48e6da00');
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  };
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = c.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, `rgb(5, ${20 + t.daylight * 24}, ${43 + t.daylight * 26})`);
  bg.addColorStop(0.56, `rgb(5, ${44 + t.daylight * 33}, ${64 + t.daylight * 24})`);
  bg.addColorStop(1, '#030f24');
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  // Hour-driven surface light, with restrained shafts that never cross the digits brightly.
  const lightX = w * (0.15 + (t.hour / 24) * 0.7);
  for (let i = 0; i < 5; i++) {
    const x = lightX + (i - 2) * w * 0.17 + Math.sin(motion * 0.09 + i) * 8;
    const ray = c.createLinearGradient(0, h * 0.22, 0, h * 0.85);
    ray.addColorStop(0, '#88e8d500');
    ray.addColorStop(0.25, `rgba(99,220,210,${0.025 + t.daylight * 0.035})`);
    ray.addColorStop(1, '#88e8d500');
    c.fillStyle = ray;
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x + w * 0.18, h * 0.85);
    c.lineTo(x + w * 0.32, h * 0.85);
    c.closePath();
    c.fill();
  }
  for (let i = 0; i < 38; i++) {
    const x = rand(i) * w + Math.sin(motion * 0.15 + i) * 5;
    const y = h * (0.3 + ((((rand(i + 80) - motion * 0.004) % 0.7) + 0.7) % 0.7));
    c.globalAlpha = 0.15 + rand(i + 9) * 0.3;
    oval(x, y, 1 + rand(i + 20), 1 + rand(i + 20), '#9ddbd6');
  }
  c.globalAlpha = 1;
  const scale = Math.min(w / 760, h / 660),
    cy = h * (h < 500 ? 0.56 : 0.58);
  c.save();
  c.translate(w / 2, cy);
  c.scale(scale, scale);
  // All swimming takes place above the reef: no route through solid scenery.
  oval(0, 95, 350, 55, '#052334');
  const edge = w / (2 * scale) + 100;
  const wrap = (value: number) => (((value % (edge * 2)) + edge * 2) % (edge * 2)) - edge;
  function fish(
    x: number,
    y: number,
    size: number,
    facing: number,
    hero = false,
    species = 0,
    phase = 0,
  ) {
    c.save();
    c.translate(x, y);
    if (!hero) c.rotate(Math.sin(motion * 0.8 + phase) * 0.035);
    c.scale(size * facing, size);
    const beat = Math.sin(motion * (hero ? 4 : 5) + phase);
    const body = hero ? '#f7a36a' : ['#78b7bd', '#699acb', '#e2c979', '#b994c0'][species % 4]!;
    c.save();
    c.translate(-13, 0);
    if (!hero) c.scale(0.85 + beat * 0.15, 1 + beat * 0.2);
    c.translate(13, 0);
    c.fillStyle = hero ? '#f6a26c' : '#5c9da7';
    c.beginPath();
    c.moveTo(-13, 0);
    c.lineTo(-26, -12);
    c.quadraticCurveTo(-21, 0, -26, 12);
    c.closePath();
    c.fill();
    c.restore();
    oval(0, 0, 19, species === 2 ? 16 : 11, body);
    if (!hero) {
      c.strokeStyle = species === 1 ? '#70e3dd' : '#ffffff40';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-12, -2);
      c.quadraticCurveTo(0, -5, 13, -2);
      c.stroke();
      if (species === 2) {
        c.fillStyle = '#e5c773';
        c.beginPath();
        c.moveTo(-8, -9);
        c.lineTo(-6, -29);
        c.lineTo(10, -8);
        c.fill();
        c.beginPath();
        c.moveTo(-8, 9);
        c.lineTo(-5, 26);
        c.lineTo(9, 8);
        c.fill();
      }
    }
    c.fillStyle = '#eee8c65a';
    c.beginPath();
    c.moveTo(1, 2);
    c.lineTo(-6, 8 + (hero ? 0 : beat * 3));
    c.lineTo(-7, 1);
    c.fill();
    if (hero) {
      c.save();
      c.beginPath();
      c.ellipse(0, 0, 19, 11, 0, 0, tau);
      c.clip();
      c.fillStyle = '#fff0d5';
      c.fillRect(-11, -12, 5, 24);
      c.fillRect(3, -12, 5, 24);
      c.restore();
      oval(-1, -10, 8, 3, '#dd7f67');
    }
    oval(12, -2, 2.5, 2.5, '#092c41');
    oval(12.7, -2.8, 0.8, 0.8, '#fff9df');
    c.restore();
  }
  // Independent shoals cross the actual viewport; resets happen fully offscreen.
  for (let group = 0; group < 2; group++) {
    const direction = group === 1 ? -1 : 1;
    const leader = motion * (9 + group * 4) + group * 313;
    for (let i = 0; i < 4; i++) {
      const phase = group * 9 + i * 0.8;
      const x = wrap(leader - i * 27) * direction;
      const y = -140 + group * 55 + Math.sin(motion * 0.35 + phase) * 10 + Math.sin(i * 2) * 13;
      c.globalAlpha = 0.45 + group * 0.18;
      fish(x, y, 0.32 + group * 0.09, direction, false, group, phase);
    }
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 1; i++) {
    const direction = i % 2 ? 1 : -1;
    fish(
      wrap(motion * (7 + i * 3) + i * 411) * direction,
      -35 + i * 20 + Math.sin(motion * 0.23 + i) * 14,
      0.65 + i * 0.08,
      direction,
      false,
      i + 1,
      i * 3,
    );
  }
  // One large visitor per 45-second slot, with an offscreen pause between visits.
  const visit = motion % 180;
  const kind = Math.floor(visit / 45); // adult shark, calf, whale, ray
  const progress = (visit % 45) / 36;
  if (kind < 3 && progress < 1) {
    const direction = kind === 1 ? -1 : 1;
    const x = (-edge - 130 + progress * (2 * edge + 260)) * direction;
    c.save();
    c.translate(x, -155 + Math.sin(motion * 0.2) * 6);
    c.scale(direction * (kind === 1 ? 0.65 : 1), kind === 1 ? 0.65 : 1);
    c.globalAlpha = kind === 2 ? 0.65 : 0.8;
    const tail = Math.sin(motion * (kind === 2 ? 0.8 : 1.6)) * 9;
    c.fillStyle = kind === 2 ? '#527f99' : '#7097a8';
    c.beginPath();
    c.moveTo(-46, 0);
    c.lineTo(-85, -28 + tail);
    c.quadraticCurveTo(-67, 0, -85, 25 + tail);
    c.closePath();
    c.fill();
    if (kind === 2) {
      oval(0, 0, 65, 27, '#527f99');
      oval(20, 12, 39, 11, '#88aebb');
      c.fillStyle = '#456d88';
      c.beginPath();
      c.moveTo(8, 10);
      c.quadraticCurveTo(-3, 43, -24, 35);
      c.lineTo(-8, 6);
      c.fill();
      c.strokeStyle = '#b6ced06b';
      c.lineWidth = 1;
      for (let n = 0; n < 4; n++) {
        c.beginPath();
        c.moveTo(12 + n * 7, 10);
        c.quadraticCurveTo(17 + n * 7, 20, 32 + n * 5, 19);
        c.stroke();
      }
    } else {
      c.beginPath();
      c.moveTo(65, 2);
      c.bezierCurveTo(36, -19, -19, -25, -54, 0);
      c.bezierCurveTo(-15, 24, 33, 20, 65, 2);
      c.fill();
      c.fillStyle = '#b0c6c8';
      c.beginPath();
      c.moveTo(61, 5);
      c.quadraticCurveTo(14, 20, -35, 5);
      c.quadraticCurveTo(8, 28, 61, 5);
      c.fill();
      c.fillStyle = '#5e879c';
      c.beginPath();
      c.moveTo(-13, -12);
      c.lineTo(1, -43);
      c.quadraticCurveTo(4, -19, 19, -13);
      c.fill();
      c.beginPath();
      c.moveTo(9, 8);
      c.lineTo(-11, 34);
      c.lineTo(-5, 7);
      c.fill();
      c.strokeStyle = '#3b6077';
      c.lineWidth = 1.5;
      for (let n = 0; n < 3; n++) {
        c.beginPath();
        c.moveTo(18 - n * 5, -4);
        c.lineTo(16 - n * 5, 5);
        c.stroke();
      }
    }
    oval(kind === 2 ? 43 : 44, -3, kind === 1 ? 3.2 : 2, 2, '#102e43');
    c.restore();
  }
  if (kind === 3 && progress < 1) {
    // A broad-winged ray glides more slowly, with a travelling wave through its fins.
    c.save();
    c.translate(-edge - 130 + progress * (2 * edge + 260), -175 + Math.sin(motion * 0.12) * 13);
    c.globalAlpha = 0.48;
    const wing = Math.sin(motion * 1.15) * 11;
    c.fillStyle = '#487b90';
    c.beginPath();
    c.moveTo(27, 0);
    c.bezierCurveTo(5, -8, -7, -42 - wing, -34, -37 - wing);
    c.quadraticCurveTo(-12, -8, -22, 0);
    c.quadraticCurveTo(-12, 8, -34, 37 + wing);
    c.bezierCurveTo(-7, 42 + wing, 5, 8, 27, 0);
    c.fill();
    c.strokeStyle = '#487b90';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-18, 0);
    c.bezierCurveTo(-42, 3, -54, Math.sin(motion * 0.8) * 10, -78, Math.sin(motion * 0.8 - 1) * 12);
    c.stroke();
    oval(13, -3, 1.5, 1.5, '#b3d1d4');
    c.restore();
  }
  // Transparent jellyfish drift on the far side of the viewing window.
  for (let j = 0; j < 3; j++) {
    const pulse = motion * (1.2 + j * 0.09) + j * 2;
    const x = wrap(motion * (3 + j * 0.8) + j * 223) + Math.sin(pulse * 0.18) * 8,
      y = -120 + (j % 3) * 52 + Math.sin(pulse) * 3 + Math.sin(motion * 0.13 + j) * 16;
    c.save();
    c.translate(x, y);
    const s = 0.45 + j * 0.13;
    c.rotate(Math.sin(motion * 0.17 + j) * 0.09);
    c.scale(s * (1 + Math.sin(pulse) * 0.07), s * (1 - Math.sin(pulse) * 0.09));
    glow(0, 0, 48, '#9e8fe52b');
    c.strokeStyle = '#bfafe75c';
    c.lineWidth = 1.5;
    for (let k = 0; k < 5; k++) {
      c.beginPath();
      c.moveTo(-16 + k * 8, 2);
      c.bezierCurveTo(
        -25 + k * 8 + Math.sin(pulse - 0.8 + k * 0.5) * 7,
        23,
        -6 + k * 8,
        28,
        -20 + k * 8 + Math.sin(pulse - 1.8 + k * 0.5) * 9,
        46,
      );
      c.stroke();
    }
    c.fillStyle = '#b3b4e744';
    c.beginPath();
    c.ellipse(0, 0, 27, 19, 0, Math.PI, tau);
    c.quadraticCurveTo(0, 12, -27, 0);
    c.fill();
    c.strokeStyle = '#d2d8f29c';
    c.beginPath();
    c.ellipse(0, 0, 27, 19, 0, Math.PI, tau);
    c.stroke();
    c.restore();
  }
  // The orange fish is the second hand; its continuous loop stays clear of the reef.
  const a = (t.second / 60) * tau - Math.PI / 2;
  c.strokeStyle = '#75c8cc24';
  c.setLineDash([2, 12]);
  c.beginPath();
  c.ellipse(0, -35, 282, 65, 0, 0, tau);
  c.stroke();
  c.setLineDash([]);
  const fx = Math.cos(a) * 282,
    fy = -35 + Math.sin(a) * 65;
  glow(fx, fy, 36, '#ffce8b25');
  fish(fx, fy, 1, -Math.sin(a) >= 0 ? 1 : -1, true);
  // Sculpted seabed and branching sea fans are foreground objects.
  oval(0, 108, 338, 36, '#163e4b');
  oval(-115, 94, 159, 25, '#214c55');
  oval(165, 101, 126, 23, '#1b4553');
  for (let i = 0; i < 12; i++) {
    const x = -307 + i * 55,
      y = 104 + rand(i + 44) * 16;
    oval(x, y, 17 + rand(i) * 16, 9 + rand(i + 8) * 7, i % 2 ? '#285967' : '#254853');
  }
  for (let j = 0; j < 9; j++) {
    const x = -302 + j * 75,
      y = 95 + rand(j) * 19,
      size = 18 + rand(j + 14) * 27;
    c.strokeStyle = j % 2 ? '#8f7192' : '#558f97';
    c.lineWidth = 3;
    c.lineCap = 'round';
    const sway = Math.sin(motion * 0.4 + j) * 2;
    for (let branch = -1; branch <= 1; branch++) {
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + branch * 6, y - size * 0.6, x + branch * 13 + sway, y - size);
      c.stroke();
      c.beginPath();
      c.moveTo(x + branch * 6, y - size * 0.55);
      c.lineTo(x + branch * 18 + sway, y - size * 0.7);
      c.stroke();
    }
  }
  // Sixty coral pearls count completed minutes, arranged as a readable necklace.
  for (let i = 0; i < 60; i++) {
    const x = -295 + i * 10,
      y = 143 + Math.sin((i / 59) * Math.PI) * 12,
      lit = i < t.lanterns;
    c.strokeStyle = '#386478';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x, y + 5);
    c.lineTo(x, y - 3);
    c.stroke();
    if (lit) glow(x, y - 4, 10, '#65f3d454');
    oval(x, y - 4, i % 5 === 0 ? 3.4 : 2.4, i % 5 === 0 ? 4 : 3, lit ? '#9ff4d5' : '#366171');
  }
  if (t.hourTurn && !reduced) {
    c.globalAlpha = (1 - t.second / 5) * 0.3;
    c.strokeStyle = '#a4f8de';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, 110, 40 + t.second * 60, 7 + t.second * 9, 0, 0, tau);
    c.stroke();
    c.globalAlpha = 1;
  }
  c.restore();
}
