import type { SceneRenderer } from '../lib/scene-catalog';
import { livingTime } from '../lib/living-time';
import anchors from '../lib/conservatory-anchors.json';

function point(values: number[]): [number, number] {
  const [x, y] = values;
  if (values.length !== 2 || typeof x !== 'number' || typeof y !== 'number') {
    throw new Error('Invalid Blender camera anchor');
  }
  return [x, y];
}

export async function loadConservatory(): Promise<SceneRenderer> {
  const load = async (name: string) => {
    const image = new Image();
    image.src = `/scenes/moonlit-conservatory/${name}.webp`;
    await image.decode();
    return image;
  };
  const [day, night] = await Promise.all([load('day'), load('night')]);
  // These axes come from the Blender camera, so rings lie on the actual water plane.
  const center = point(anchors.water.center);
  const waterX = point(anchors.water.x);
  const waterY = point(anchors.water.y);
  const fireflies = anchors.fireflies.map(point);
  return ({ context: c, width, height, ratio, date, reducedMotion }) => {
    const { daylight } = livingTime(date);
    const motion = reducedMotion ? 0 : date.getTime() / 1000;
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    const sky = c.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#101d2c');
    sky.addColorStop(0.6, '#213c45');
    sky.addColorStop(1, '#0d2028');
    c.fillStyle = sky;
    c.fillRect(0, 0, width, height);
    const daySky = c.createLinearGradient(0, 0, 0, height);
    daySky.addColorStop(0, '#304951');
    daySky.addColorStop(0.55, '#628077');
    daySky.addColorStop(1, '#263f40');
    c.globalAlpha = daylight;
    c.fillStyle = daySky;
    c.fillRect(0, 0, width, height);
    c.globalAlpha = 1;
    for (let i = 0; i < 32; i++) {
      const sx = ((i * 0.618034) % 1) * width;
      const sy = ((i * 0.381966) % 1) * height * 0.55;
      c.fillStyle = `rgba(211, 230, 226, ${(1 - daylight) * (0.12 + (i % 3) * 0.06)})`;
      c.beginPath();
      c.arc(sx, sy, i % 4 === 0 ? 1 : 0.6, 0, Math.PI * 2);
      c.fill();
    }
    // Fit the entire diorama between shared controls, including short fullscreen windows.
    const portrait = width < 580 && height > width;
    const top = height < 500 ? 175 : portrait ? 180 : 190;
    const bottom = portrait ? 165 : height < 500 ? 95 : 120;
    const available = Math.max(80, height - top - bottom);
    // Visible Blender silhouette is approximately x250..1190, y160..920.
    const scale = Math.min((width - 24) / 1000, available / 760);
    const ox = width / 2 - 720 * scale;
    const oy = top + (available - 760 * scale) / 2 - 160 * scale;
    c.save();
    c.translate(ox, oy);
    c.scale(scale, scale);
    c.drawImage(night, 0, 0);
    c.globalAlpha = daylight;
    c.drawImage(day, 0, 0);
    c.globalAlpha = 1;
    c.save();
    c.transform(
      waterX[0] - center[0],
      waterX[1] - center[1],
      waterY[0] - center[0],
      waterY[1] - center[1],
      center[0],
      center[1],
    );
    for (let i = 0; i < 3; i++) {
      const phase = (motion / 9 + i / 3) % 1;
      c.strokeStyle = `rgba(196, 225, 206, ${Math.sin(phase * Math.PI) * 0.22})`;
      c.lineWidth = 0.015;
      c.beginPath();
      c.arc(0, 0, 0.1 + phase * 0.6, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
    // Local loops stay beside the plants; no particles fly through the glazing.
    for (const [i, [fx, fy]] of fireflies.entries()) {
      const a = motion / (5 + i) + i * 2.1;
      const px = fx + Math.sin(a) * 9;
      const py = fy + Math.cos(a * 2) * 7;
      const intensity = (1 - daylight) * (0.4 + 0.2 * Math.sin(a * 3));
      const glow = c.createRadialGradient(px, py, 0, px, py, 13);
      glow.addColorStop(0, `rgba(232, 224, 150, ${intensity})`);
      glow.addColorStop(1, 'rgba(232, 224, 150, 0)');
      c.fillStyle = glow;
      c.fillRect(px - 13, py - 13, 26, 26);
      c.fillStyle = `rgba(250, 244, 193, ${intensity})`;
      c.beginPath();
      c.arc(px, py, 1.8, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  };
}
