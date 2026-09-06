import { livingTime } from '../lib/living-time';

type Point = [number, number];
const TAU = Math.PI * 2;
const seed = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const stars = Array.from({ length: 75 }, (_, i) => [seed(i), seed(i + 80), seed(i + 150)] as const);
const trees = Array.from({ length: 18 }, (_, i) => ({
  x: -260 + seed(i + 2) * 490,
  y: -35 - seed(i + 52) * 48,
  scale: 0.6 + seed(i + 61) * 0.65,
}));
const palettes = [
  { at: 0, sky: '#101c39', horizon: '#46516e', water: '#163c51', grass: '#35636a' },
  { at: 5, sky: '#303454', horizon: '#b9808b', water: '#33566c', grass: '#5b7c76' },
  { at: 6.5, sky: '#8fa7bd', horizon: '#f8c9a1', water: '#63999f', grass: '#85a57d' },
  { at: 9, sky: '#6eacc3', horizon: '#e2ead3', water: '#509ca9', grass: '#82ae83' },
  { at: 15, sky: '#72a8be', horizon: '#e9dbb8', water: '#5798a2', grass: '#91ae7d' },
  { at: 18, sky: '#655a87', horizon: '#f6ae89', water: '#706e8e', grass: '#8d9280' },
  { at: 20, sky: '#192d50', horizon: '#69718d', water: '#284d68', grass: '#496b70' },
  { at: 24, sky: '#101c39', horizon: '#46516e', water: '#163c51', grass: '#35636a' },
];
function mix(a: string, b: string, t: number): string {
  const c = (v: string, i: number) => parseInt(v.slice(i, i + 2), 16);
  return (
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(c(a, i) * (1 - t) + c(b, i) * t)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function drawIsle(
  c: CanvasRenderingContext2D,
  width: number,
  height: number,
  ratio: number,
  now: Date,
  reducedMotion: boolean,
) {
  const t = livingTime(now);
  function poly(points: Point[], color: string): void {
    c.fillStyle = color;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  }
  function ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string | CanvasGradient,
  ): void {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU);
    c.fill();
  }
  function line(x: number, y: number, x2: number, y2: number, color: string, w = 1): void {
    c.strokeStyle = color;
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x2, y2);
    c.stroke();
  }
  function glow(x: number, y: number, r: number, color: string): void {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, '#ffe8a000');
    ellipse(x, y, r, r, g);
  }

  const seconds = reducedMotion ? Math.floor(t.second) : t.second;
  const moving = reducedMotion ? 0 : now.getTime() / 1000;
  const night = 1 - t.daylight;
  const index = palettes.findIndex(
    (p, i) => i < palettes.length - 1 && t.hour >= p.at && t.hour < palettes[i + 1]!.at,
  );
  const a = palettes[Math.max(0, index)]!;
  const b = palettes[Math.max(0, index) + 1]!;
  const blend = (t.hour - a.at) / (b.at - a.at);
  const sky = mix(a.sky, b.sky, blend),
    horizon = mix(a.horizon, b.horizon, blend),
    water = mix(a.water, b.water, blend),
    grass = mix(a.grass, b.grass, blend);
  c.setTransform(ratio, 0, 0, ratio, 0, 0);
  const background = c.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, sky);
  background.addColorStop(0.43, horizon);
  background.addColorStop(0.46, water);
  background.addColorStop(1, mix(water, '#081f35', 0.65));
  c.fillStyle = background;
  c.fillRect(0, 0, width, height);
  // The calm dark veil keeps the clock legible, even against noon skies.
  const veil = c.createLinearGradient(0, 0, 0, height * 0.48);
  veil.addColorStop(0, '#0a16365c');
  veil.addColorStop(1, '#0a163600');
  c.fillStyle = veil;
  c.fillRect(0, 0, width, height * 0.48);
  if (night > 0.05)
    stars.forEach(([x, y, size], i) => {
      const shimmer = reducedMotion ? 0.75 : 0.6 + 0.4 * Math.sin(moving * 0.3 + i);
      c.globalAlpha = night * shimmer;
      ellipse(x * width, 40 + y * height * 0.4, 0.7 + size * 1.1, 0.7 + size * 1.1, '#fff0d4');
    });
  c.globalAlpha = 1;
  const dayOrbit = t.hour >= 6 && t.hour < 18;
  const orbit = dayOrbit ? (t.hour - 6) / 12 : ((t.hour + 6) % 24) / 12;
  const sunX = width * (0.12 + orbit * 0.76),
    sunY = height * (0.43 - Math.sin(orbit * Math.PI) * 0.25);
  const disc = Math.max(12, Math.min(width * 0.029, 33));
  glow(sunX, sunY, disc * 3, dayOrbit ? '#ffe5b34d' : '#ceeaff29');
  ellipse(sunX, sunY, disc, disc, dayOrbit ? '#ffdea1' : '#e7edd6');
  if (!dayOrbit) {
    ellipse(sunX + disc * 0.25, sunY - disc * 0.1, disc * 0.8, disc * 0.9, mix(sky, horizon, 0.4));
  }
  // Distant headlands and cloud ribbons give the island a world beyond its shore.
  for (let i = 0; i < 3; i++) {
    const base = height * (0.405 + i * 0.012);
    poly(
      [
        [0, base],
        [width * 0.08, base - height * 0.03],
        [width * 0.18, base - height * 0.02],
        [width * 0.28, base - height * 0.055],
        [width * 0.39, base],
        [width * 0.65, base],
        [width * 0.78, base - height * 0.05],
        [width * 0.85, base - height * 0.035],
        [width, base - height * 0.06],
        [width, height * 0.46],
        [0, height * 0.46],
      ],
      mix(horizon, water, 0.4 + i * 0.18),
    );
  }
  for (let i = 0; i < 4; i++) {
    const x = ((seed(i + 201) * width + moving * (1 + i * 0.15)) % (width + 240)) - 120;
    const y = height * (0.24 + seed(i + 210) * 0.18);
    c.globalAlpha = 0.13 + t.daylight * 0.1;
    ellipse(x, y, 60 + width * 0.025, 6, '#fff3d9');
    ellipse(x + 24, y - 5, 34, 9, '#fff3d9');
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 35; i++) {
    const x = seed(i + 310) * width;
    const y = height * (0.47 + seed(i + 340) * 0.51);
    const shift = Math.sin(moving * 0.5 + i) * 6;
    line(x + shift, y, x + shift + 8 + seed(i) * 28, y, mix(water, '#cfddd1', 0.22), 1);
  }
  // A centered miniature: no camera drift, no accumulating simulation state.
  const orbitRadius = width < 580 ? 345 : 411;
  const scale = Math.min(width / (width < 580 ? 770 : 990), height / 620) * 0.94;
  const centerY = height < 500 ? height * 0.59 : width < 580 ? height * 0.53 : height * 0.61;
  c.save();
  c.translate(width / 2, centerY);
  c.scale(scale, scale);
  ellipse(8, 97, 331, 102, '#102c4240');
  // Ferry route. The four pearl buoys mark 0, 15, 30 and 45 seconds.
  c.strokeStyle = mix(water, '#c4e7da', 0.22);
  c.lineWidth = 1.2;
  c.setLineDash([2, 11]);
  c.beginPath();
  c.ellipse(0, 56, orbitRadius, 141, 0, 0, TAU);
  c.stroke();
  c.setLineDash([]);
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * TAU - Math.PI / 2;
    const x = Math.cos(ang) * orbitRadius,
      y = 56 + Math.sin(ang) * 141;
    ellipse(x, y + 2, 6, 2.5, '#132c4759');
    ellipse(x, y, 3, 3, '#efdfb3');
  }
  // Water-level objects precede the raised island. The shore, buildings and pier
  // occlude the rear ferry and wake, while the front route stays on open water.
  // The route's center is lower than the island top because it lies at sea level.
  const bx = Math.cos((seconds / 60) * TAU - Math.PI / 2) * orbitRadius;
  const by = 56 + Math.sin((seconds / 60) * TAU - Math.PI / 2) * 141;
  // The ferry's orbit is the seconds hand, never an arbitrary animation loop.
  for (let i = 1; i <= 6; i++) {
    const angle = (seconds / 60 - i * 0.006) * TAU - Math.PI / 2;
    c.globalAlpha = (1 - i / 7) * 0.5;
    ellipse(Math.cos(angle) * orbitRadius, 56 + Math.sin(angle) * 141, 7 + i * 2, 2, '#e2ece0');
  }
  c.globalAlpha = 1;
  c.save();
  c.translate(bx, by + (reducedMotion ? 0 : Math.sin(moving * 2) * 1.2));
  if (Math.sin((seconds / 60) * TAU - Math.PI / 2) > 0) c.scale(-1, 1);
  ellipse(0, 6, 20, 5, '#183b5545');
  poly(
    [
      [-23, -1],
      [23, -1],
      [15, 9],
      [-13, 9],
    ],
    '#d99080',
  );
  poly(
    [
      [-21, -1],
      [21, -1],
      [17, 3],
      [-17, 3],
    ],
    '#f6d8ae',
  );
  c.fillStyle = '#eee2bb';
  c.fillRect(-9, -14, 22, 13);
  c.fillStyle = '#426c7d';
  c.fillRect(-5, -11, 7, 6);
  c.fillRect(5, -11, 5, 6);
  c.fillStyle = '#618b90';
  c.fillRect(-12, -17, 28, 4);
  line(0, -17, 0, -29, '#c7cdb4', 2);
  poly(
    [
      [0, -29],
      [14, -25],
      [0, -22],
    ],
    '#f0c589',
  );
  if (night > 0.1) {
    glow(19, -3, 12, '#ffe0a474');
    ellipse(19, -3, 2, 2, '#fff0b9');
  }
  c.restore();
  // Soft, hand-shaped strata rather than blocks or borrowed game geometry.
  c.fillStyle = mix('#567877', '#21394e', night * 0.6);
  c.beginPath();
  c.moveTo(-294, -24);
  c.bezierCurveTo(-320, 10, -278, 78, -193, 103);
  c.bezierCurveTo(-66, 161, 138, 128, 257, 70);
  c.bezierCurveTo(309, 37, 316, -11, 273, -33);
  c.closePath();
  c.fill();
  poly(
    [
      [-265, 34],
      [-232, 86],
      [-182, 107],
      [-189, 53],
    ],
    mix('#77918b', '#344e60', night),
  );
  poly(
    [
      [-155, 76],
      [-128, 128],
      [-58, 143],
      [-48, 84],
    ],
    mix('#93a49a', '#3e5b66', night),
  );
  poly(
    [
      [104, 77],
      [95, 126],
      [158, 103],
      [187, 47],
    ],
    mix('#668280', '#254553', night),
  );
  c.fillStyle = mix('#d4bd8e', '#8b9584', night * 0.5);
  c.beginPath();
  c.ellipse(0, 0, 313, 102, -0.025, 0, TAU);
  c.fill();
  ellipse(-1, -8, 292, 89, grass);
  ellipse(-128, -11, 146, 51, mix(grass, '#bdd193', 0.23));
  // A garden pond, its little spillway touching the harbor once per second.
  ellipse(-192, -2, 38, 15, mix(water, '#acdace', 0.3));
  ellipse(-196, -5, 23, 4, '#d7eddd38');
  c.strokeStyle = '#b1d7ce8c';
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(-215, 6);
  c.bezierCurveTo(-265, 22, -249, 63, -239, 79);
  c.stroke();
  c.globalAlpha = 0.15 + (1 - (seconds % 1)) * 0.2;
  ellipse(-239, 83, 11 + (seconds % 1) * 13, 4 + (seconds % 1) * 4, '#e5eee2');
  c.globalAlpha = 1;
  // Sixty lantern posts on the oval promenade: one additional lamp each minute.
  c.strokeStyle = mix('#dcccaa', '#95a69a', night * 0.65);
  c.lineWidth = 9;
  c.beginPath();
  c.ellipse(0, -3, 272, 75, 0, 0, TAU);
  c.stroke();
  c.strokeStyle = '#435c614d';
  c.lineWidth = 1;
  c.beginPath();
  c.ellipse(0, -3, 280, 80, 0, 0, TAU);
  c.stroke();
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * TAU - Math.PI / 2,
      x = Math.cos(angle) * 272,
      y = -3 + Math.sin(angle) * 75;
    const lit = i < t.lanterns;
    const marker = i % 5 === 0;
    line(x, y, x, y - (marker ? 12 : 7), '#52666a', 1.8);
    if (lit && night > 0.2) glow(x, y - 9, marker ? 12 : 8, '#ffcf6652');
    ellipse(
      x,
      y - (marker ? 12 : 7),
      marker ? 3.7 : 2.6,
      marker ? 3.7 : 2.6,
      lit ? '#ffe2a0' : mix(grass, '#254753', 0.4),
    );
  }
  function tree(x: number, y: number, size: number): void {
    c.save();
    c.translate(x, y);
    c.scale(size, size);
    ellipse(4, 4, 17, 5, '#1b45422b');
    line(0, 0, 0, -32, '#526a61', 4);
    ellipse(-8, -33, 14, 22, mix('#5e9580', '#294c58', night * 0.8));
    ellipse(7, -40, 13, 25, mix('#83b090', '#416577', night * 0.8));
    ellipse(-2, -47, 8, 18, mix('#a3c391', '#4e7980', night * 0.8));
    c.restore();
  }
  trees.filter((v) => v.x < -95 || v.x > 220).forEach((v) => tree(v.x, v.y, v.scale));
  // A small observatory, bakery and homes; windows wake up after sunset.
  function house(x: number, y: number, size: number, roof: string, id: number): void {
    c.save();
    c.translate(x, y);
    c.scale(size, size);
    ellipse(3, 5, 38, 10, '#1f35432b');
    poly(
      [
        [-30, -2],
        [9, 13],
        [9, -31],
        [-30, -43],
      ],
      mix('#e7d9b8', '#839297', night * 0.75),
    );
    poly(
      [
        [9, 13],
        [35, -3],
        [35, -44],
        [9, -31],
      ],
      mix('#b9c7b2', '#566e7e', night * 0.75),
    );
    poly(
      [
        [-37, -44],
        [5, -65],
        [40, -47],
        [9, -28],
      ],
      mix(roof, '#3b4766', night * 0.4),
    );
    poly(
      [
        [-37, -44],
        [9, -28],
        [9, -22],
        [-37, -38],
      ],
      mix(roof, '#172e42', 0.17),
    );
    for (let w = 0; w < 2; w++) {
      const wx = -22 + w * 15,
        wy = -28 + w * 5;
      const color = night > 0.2 && (id + w + Math.floor(t.hour)) % 5 !== 0 ? '#ffd491' : '#547d87';
      if (night > 0.2) glow(wx + 4, wy + 5, 12, '#ffd18b22');
      poly(
        [
          [wx, wy],
          [wx + 8, wy + 3],
          [wx + 8, wy + 15],
          [wx, wy + 12],
        ],
        color,
      );
    }
    poly(
      [
        [18, -14],
        [26, -19],
        [26, 3],
        [18, 8],
      ],
      '#3c5e65',
    );
    line(-7, -26, -7, 5, '#aab39d', 1);
    // Chimney smoke is tied to real seconds; reduced-motion leaves a still wisp.
    poly(
      [
        [-10, -57],
        [-10, -69],
        [-3, -72],
        [-3, -60],
      ],
      mix('#c8bcaa', '#677a84', night),
    );
    for (let puff = 0; puff < 3; puff++) {
      const progress = (moving * 0.16 + puff / 3 + id * 0.11) % 1;
      c.globalAlpha = (1 - progress) * 0.24;
      ellipse(
        -5 + progress * 15,
        -77 - progress * 26,
        3 + progress * 8,
        3 + progress * 6,
        '#f2e3d5',
      );
    }
    c.globalAlpha = 1;
    c.restore();
  }
  house(-85, -30, 0.9, '#c88e80', 0);
  house(7, -62, 1.05, '#648c9d', 1);
  house(88, -23, 0.86, '#dbab7f', 2);
  house(-35, 22, 1.15, '#d89484', 3);
  // Bakery striped awning and a bench for the island's tiny resident.
  poly(
    [
      [-71, -5],
      [-24, 10],
      [-31, 20],
      [-78, 4],
    ],
    '#e7d6b0',
  );
  for (let i = 0; i < 5; i++) line(-73 + i * 9, -4 + i * 3, -78 + i * 9, 4 + i * 3, '#b57971', 4);
  tree(134, -5, 1.1);
  tree(-140, -48, 0.9);
  tree(45, 45, 0.65);
  // Lighthouse with a working hour/minute dial and a second-following beam.
  const lx = 204,
    ly = -31;
  ellipse(lx + 6, ly + 10, 34, 10, '#263b4b30');
  poly(
    [
      [lx - 20, ly],
      [lx + 20, ly + 5],
      [lx + 13, ly - 129],
      [lx - 12, ly - 132],
    ],
    mix('#f1dfba', '#a7b6b1', night * 0.7),
  );
  poly(
    [
      [lx + 20, ly + 5],
      [lx + 31, ly - 5],
      [lx + 22, ly - 133],
      [lx + 13, ly - 129],
    ],
    mix('#b7c7b3', '#617e8c', night * 0.7),
  );
  poly(
    [
      [lx - 15, ly - 68],
      [lx + 17, ly - 64],
      [lx + 18, ly - 82],
      [lx - 14, ly - 86],
    ],
    mix('#d28d7c', '#806c79', night * 0.6),
  );
  c.fillStyle = '#354f5d';
  c.fillRect(lx - 17, ly - 143, 38, 10);
  c.fillStyle = '#ffe2a3';
  c.fillRect(lx - 12, ly - 159, 28, 16);
  poly(
    [
      [lx - 24, ly - 160],
      [lx + 2, ly - 181],
      [lx + 28, ly - 158],
    ],
    '#ad7d7a',
  );
  line(lx + 2, ly - 181, lx + 2, ly - 193, '#536772', 2);
  poly(
    [
      [lx + 2, ly - 193],
      [lx + 23, ly - 188 + Math.sin(moving) * 2],
      [lx + 2, ly - 183],
    ],
    '#e8c68b',
  );
  glow(lx + 2, ly - 151, 28, '#ffd78c6b');
  if (night > 0.15) {
    c.globalAlpha = night * 0.13;
    poly(
      [
        [lx + 2, ly - 151],
        [bx - 45, by + 5],
        [bx + 45, by + 5],
      ],
      '#ffe5ae',
    );
    c.globalAlpha = 1;
  }
  ellipse(lx, ly - 108, 9, 10, '#f9e8bf');
  const ha = (t.hour / 12) * TAU - Math.PI / 2,
    ma = (t.minute / 60) * TAU - Math.PI / 2;
  line(lx, ly - 108, lx + Math.cos(ha) * 4, ly - 108 + Math.sin(ha) * 4, '#405263', 2);
  line(lx, ly - 108, lx + Math.cos(ma) * 7, ly - 108 + Math.sin(ma) * 7, '#405263', 1.4);
  // Wooden pier, flower pots, and a cat whose tail ticks quietly with the seconds.
  poly(
    [
      [107, 66],
      [130, 59],
      [175, 127],
      [150, 135],
    ],
    '#c5ad89',
  );
  for (let i = 0; i < 7; i++)
    line(113 + i * 6, 70 + i * 9, 134 + i * 6, 63 + i * 9, '#8c9280', 1.5);
  line(151, 132, 151, 151, '#7e8e7e', 4);
  line(173, 124, 173, 143, '#7e8e7e', 4);
  for (let i = 0; i < 8; i++) {
    const x = -101 + i * 19,
      y = 43 + Math.sin(i) * 9;
    ellipse(x, y, 4, 2, '#46675b');
    ellipse(x, y - 3, 3, 3, i % 2 ? '#e8b4a2' : '#efdaa0');
  }
  ellipse(-102, 31, 5, 8, '#f0dabb');
  ellipse(-102, 23, 5, 4, '#f0dabb');
  poly(
    [
      [-107, 23],
      [-107, 17],
      [-102, 21],
      [-97, 17],
      [-97, 24],
    ],
    '#f0dabb',
  );
  c.strokeStyle = '#f0dabb';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-99, 36);
  c.quadraticCurveTo(-85, 41, -89 + Math.sin(moving) * 2, 29);
  c.stroke();
  // Two unhurried walkers, with footfalls derived from the real second.
  for (let person = 0; person < 2; person++) {
    const pos = ((t.minute / 60 + person * 0.42) % 1) * TAU;
    const x = Math.cos(pos) * 246,
      y = -3 + Math.sin(pos) * 67;
    ellipse(x + 2, y + 2, 5, 2, '#2545523d');
    line(x - 2, y - 1, x - 2 + Math.sin(moving * 3) * 2, y + 4, '#314e5b', 2);
    line(x + 2, y - 1, x + 2 - Math.sin(moving * 3) * 2, y + 4, '#314e5b', 2);
    c.fillStyle = person ? '#eac79a' : '#d8978b';
    c.fillRect(x - 3, y - 9, 6, 10);
    ellipse(x, y - 12, 3.5, 3.5, '#e4c8a7');
  }
  // At each hour the island releases a quiet ring of light, rather than a sound.
  if (t.hourTurn && !reducedMotion) {
    const p = t.second / 5;
    c.globalAlpha = (1 - p) * 0.4;
    c.strokeStyle = '#ffe7b4';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, 10, 300 + p * 130, 95 + p * 65, 0, 0, TAU);
    c.stroke();
    c.globalAlpha = 1;
  }
  // Fireflies come out at night, following small paths rather than random jumps.
  if (night > 0.3)
    for (let i = 0; i < 9; i++) {
      const x = (seed(i + 460) - 0.5) * 430 + Math.sin(moving * 0.4 + i) * 8;
      const y = -30 + seed(i + 475) * 95 + Math.cos(moving * 0.3 + i) * 4;
      c.globalAlpha = night * (0.55 + Math.sin(moving + i) * 0.25);
      ellipse(x, y, 1.7, 1.7, '#ffdf9a');
    }
  c.globalAlpha = 1;
  c.restore();
}
