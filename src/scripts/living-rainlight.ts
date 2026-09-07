import type { SceneRenderer } from '../lib/scene-catalog';
import { livingTime } from '../lib/living-time';

// Coordinates belong to window.webp; the right mask stops before the foreground plant.
export async function loadRainlight(): Promise<SceneRenderer> {
  const background = new Image();
  background.src = '/scenes/rainlight/window.webp';
  await background.decode();
  const glass = new Path2D();
  glass.rect(368, 0, 512, 724);
  glass.moveTo(916, 0);
  glass.lineTo(1380, 0);
  glass.lineTo(1380, 140);
  glass.lineTo(1230, 330);
  glass.lineTo(1210, 725);
  glass.lineTo(916, 725);
  glass.closePath();
  const drops = Array.from({ length: 64 }, (_, i) => ({
    x: 375 + ((i * 137.51) % 980),
    offset: (i * 0.61803398875) % 1,
    duration: 12 + (i % 9) * 3,
    length: 8 + (i % 5) * 4,
  }));
  return ({ context: c, width, height, ratio, date, reducedMotion }) => {
    const t = livingTime(date);
    const motion = reducedMotion ? 0 : date.getTime() / 1000;
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    c.fillStyle = '#111e25';
    c.fillRect(0, 0, width, height);
    // Keep the entire still life visible on phones, with quiet space for shared controls.
    const mobile = width < 580 && height > width;
    const artHeight = mobile ? height - 220 : height;
    const scale = Math.max(width / 1536, artHeight / 1024);
    const x = (width - 1536 * scale) / 2;
    const y = mobile ? 140 : (height - 1024 * scale) / 2;
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    c.drawImage(background, 0, 0, 1536, 1024);
    c.fillStyle = `rgba(7, 17, 39, ${(1 - t.daylight) * 0.33})`;
    c.fillRect(0, 0, 1536, 1024);
    c.save();
    c.clip(glass);
    c.fillStyle = `rgba(178, 207, 214, ${t.daylight * 0.1})`;
    c.fillRect(0, 0, 1536, 750);
    c.lineCap = 'round';
    for (const drop of drops) {
      const phase = (motion / drop.duration + drop.offset) % 1;
      const dy = phase * 810 - 40;
      const alpha = Math.sin(phase * Math.PI) * 0.23;
      c.strokeStyle = `rgba(192, 218, 222, ${alpha})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(drop.x, dy - drop.length);
      c.quadraticCurveTo(drop.x + 1.8, dy - 4, drop.x, dy);
      c.stroke();
      c.fillStyle = `rgba(212, 228, 228, ${alpha + 0.04})`;
      c.beginPath();
      c.ellipse(drop.x, dy, 1.25, 2.3, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
    const glow = c.createRadialGradient(270, 535, 10, 270, 535, 360);
    glow.addColorStop(0, `rgba(255, 182, 76, ${0.1 + (1 - t.daylight) * 0.13})`);
    glow.addColorStop(1, 'rgba(255, 182, 76, 0)');
    c.fillStyle = glow;
    c.fillRect(0, 220, 650, 700);
    c.restore();
    if (mobile) {
      const edge = c.createLinearGradient(0, y, 0, y + 70);
      edge.addColorStop(0, '#111e25');
      edge.addColorStop(1, 'rgba(17, 30, 37, 0)');
      c.fillStyle = edge;
      c.fillRect(0, y, width, 70);
    }
    const scrim = c.createLinearGradient(0, 0, 0, height);
    scrim.addColorStop(0, 'rgba(9, 19, 27, .56)');
    scrim.addColorStop(0.28, 'rgba(9, 19, 27, 0)');
    scrim.addColorStop(0.68, 'rgba(9, 19, 27, 0)');
    scrim.addColorStop(1, 'rgba(9, 19, 27, .85)');
    c.fillStyle = scrim;
    c.fillRect(0, 0, width, height);
  };
}
