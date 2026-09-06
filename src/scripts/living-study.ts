import { livingTime } from '../lib/living-time';
import type { SceneRenderer } from '../lib/scene-catalog';

/** Coordinates below belong to the immutable 1536 × 1024 room artwork. */
export async function loadStudy(): Promise<SceneRenderer> {
  const room = new Image();
  room.src = '/scenes/quiet-study/room.webp';
  await room.decode();
  const dates = {
    ko: new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }),
    en: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }),
  };
  return ({ context: c, width, height, ratio, date, reducedMotion, ko }) => {
    const t = livingTime(date);
    const night = 1 - t.daylight;
    const motion = reducedMotion ? 0 : date.getTime() / 1000;
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    c.fillStyle = '#19232b';
    c.fillRect(0, 0, width, height);
    // Portrait crops keep BOTH the face and desk clock in view. Controls have a
    // separate safe area, rather than floating over the character's face.
    const portrait = width < 600;
    const top = portrait ? 150 : 0;
    const bottom = portrait ? 145 : 0;
    const available = Math.max(120, height - top - bottom);
    const scale = Math.max(width / 1536, available / 1024);
    const x = Math.min(0, Math.max(width - 1536 * scale, width * 0.5 - 980 * scale));
    const y = top + (available - 1024 * scale) * 0.5;
    c.save();
    c.beginPath();
    c.rect(0, top, width, available);
    c.clip();
    c.translate(x, y);
    c.scale(scale, scale);
    c.drawImage(room, 0, 0, 1536, 1024);
    // The entire room changes light; warm lamp pools stay warm at night.
    c.fillStyle = `rgba(12, 22, 48, ${night * 0.48})`;
    c.fillRect(0, 0, 1536, 1024);
    if (t.phase === 'dawn' || t.phase === 'dusk') {
      c.fillStyle = 'rgba(240, 137, 72, 0.12)';
      c.fillRect(0, 0, 1536, 1024);
    }
    c.save();
    c.beginPath();
    c.moveTo(983, 0);
    c.lineTo(1254, 0);
    c.lineTo(1254, 326);
    c.lineTo(1234, 332);
    c.lineTo(1224, 387);
    c.lineTo(1195, 412);
    c.lineTo(1190, 443);
    c.lineTo(1144, 448);
    c.lineTo(1136, 482);
    c.lineTo(981, 482);
    c.closePath();
    // Upper left pane stops above the silhouette of the hair.
    c.rect(851, 0, 67, 186);
    c.clip();
    const sky = c.createLinearGradient(0, 0, 0, 485);
    const golden = t.phase === 'dawn' || t.phase === 'dusk';
    sky.addColorStop(
      0,
      night > 0.4 ? `rgba(13, 22, 61, ${night * 0.93})` : golden ? '#c57a8b99' : '#81bee533',
    );
    sky.addColorStop(
      1,
      night > 0.4 ? `rgba(34, 39, 71, ${night * 0.8})` : golden ? '#f7b37088' : '#d5edf21a',
    );
    c.fillStyle = sky;
    c.fillRect(800, 0, 480, 485);
    if (night > 0.2) {
      for (let i = 0; i < 26; i++) {
        const sx = 990 + ((i * 71) % 254),
          sy = 16 + ((i * 47) % 222);
        c.fillStyle = `rgba(255, 243, 210, ${night * (0.5 + 0.2 * Math.sin(motion * 0.3 + i))})`;
        c.beginPath();
        c.arc(sx, sy, i % 3 ? 1 : 1.6, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = `rgba(247, 239, 210, ${night})`;
      c.beginPath();
      c.arc(1114, 94, 20, 0, Math.PI * 2);
      c.fill();
      for (let i = 0; i < 32; i++) {
        c.fillStyle = `rgba(255, 206, 125, ${night * 0.65})`;
        c.fillRect(994 + ((i * 37) % 228), 310 + ((i * 19) % 158), 2, 3);
      }
    }
    c.fillStyle = `rgba(255, 246, 227, ${0.12 + t.daylight * 0.2})`;
    for (let i = 0; i < 3; i++) {
      const cx = 905 + ((motion * 3 + i * 137) % 420);
      c.beginPath();
      c.ellipse(cx, 66 + i * 62, 39, 5, -0.08, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
    const lamp = c.createRadialGradient(1368, 355, 10, 1290, 560, 440);
    lamp.addColorStop(0, `rgba(255, 194, 108, ${0.04 + night * 0.18})`);
    lamp.addColorStop(1, '#ffbe6800');
    c.fillStyle = lamp;
    c.fillRect(880, 220, 656, 690);
    // A real clock painted only on the blank face, using the supplied preview date.
    c.save();
    c.translate(1275, 605);
    c.rotate(0.025);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#f4ead7';
    c.font = '13px system-ui, sans-serif';
    c.fillText(dates[ko ? 'ko' : 'en'].format(date), 0, -35);
    c.font = '38px ui-monospace, monospace';
    const pad = (n: number) => String(n).padStart(2, '0');
    c.fillText(`${pad(date.getHours())}:${pad(date.getMinutes())}`, 0, 0);
    c.font = '12px ui-monospace, monospace';
    c.fillStyle = '#c7d6ba';
    c.fillText(`${pad(date.getSeconds())} s`, 0, 34);
    c.restore();
    // Gentle steam is decorative; freeze it for reduced motion.
    c.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) {
      const shift = Math.sin(motion * 0.6 + i) * 9;
      c.strokeStyle = `rgba(255, 239, 216, ${0.15 + 0.07 * Math.sin(motion * 0.4 + i)})`;
      c.beginPath();
      c.moveTo(564 + i * 21, 672);
      c.bezierCurveTo(545 + i * 21 + shift, 639, 589 + i * 15 + shift, 612, 564 + i * 21, 578);
      c.stroke();
    }
    c.restore();
    // Text scrims leave the actual illustration untouched in its center.
    const veil = c.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, '#111f30bb');
    veil.addColorStop(0.27, '#111f3000');
    veil.addColorStop(0.72, '#111f3000');
    veil.addColorStop(1, '#081726ef');
    c.fillStyle = veil;
    c.fillRect(0, 0, width, height);
  };
}
