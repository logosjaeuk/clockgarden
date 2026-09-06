import { livingTime } from '../lib/living-time';
import {
  scenes,
  readScenePreferences,
  type SceneDefinition,
  type SceneRenderer,
} from '../lib/scene-catalog';
import { readStored, writeStored } from '../lib/storage';
import { createSceneLibrary } from './scene-library';

export function createLivingClock(root: HTMLElement, ko: boolean) {
  const world = root.querySelector<HTMLElement>('[data-living-world]')!;
  const canvas = world.querySelector<HTMLCanvasElement>('canvas')!;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas unavailable');
  const phase = world.querySelector<HTMLElement>('[data-living-phase]')!;
  const preview = world.querySelector<HTMLElement>('[data-living-preview]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const preferences = readStored('cg-scenes-v1', readScenePreferences, readScenePreferences(null));
  const save = () => writeStored('cg-scenes-v1', preferences);
  const loaded = new Map<string, SceneRenderer>();
  let scene: SceneDefinition = scenes[0]!;
  let render: SceneRenderer | undefined;
  let enabled = false,
    visible = true,
    frame = 0,
    lastFrame = -Infinity;
  let width = 0,
    height = 0,
    ratio = 1,
    previewOffset = 0,
    previewUntil = 0;
  let lastLabel = '',
    request = 0;
  const currentDate = () => new Date(Date.now() + previewOffset);

  async function selectScene(id: string): Promise<boolean> {
    const next = scenes.find((s) => s.id === id);
    if (!next) return false;
    const token = ++request;
    try {
      let renderer = loaded.get(id);
      if (!renderer) {
        renderer = await next.load();
        loaded.set(id, renderer);
      }
      if (token !== request) return false;
      // Bound decoded artwork even after browsing hundreds of scenes.
      loaded.delete(id);
      loaded.set(id, renderer);
      while (loaded.size > 4) loaded.delete(loaded.keys().next().value!);
      scene = next;
      render = renderer;
      preferences.selected = id;
      save();
      root.dataset.scene = id;
      root.classList.toggle('is-words', next.presentation === 'words');
      root.classList.toggle('is-illustration', next.presentation === 'illustration');
      world.querySelector<HTMLElement>('[data-word-clock]')!.hidden = next.presentation !== 'words';
      world.querySelector('.living-wordmark')!.textContent = next.name[ko ? 'ko' : 'en'];
      world
        .querySelectorAll('.living-legend b')
        .forEach((el, i) => (el.textContent = next.legend[i]![ko ? 'ko' : 'en']));
      lastLabel = '';
      lastFrame = -Infinity;
      resize();
      return true;
    } catch {
      phase.textContent = ko
        ? '풍경을 불러오지 못했습니다. 다시 선택해 주세요.'
        : 'Could not load scene. Please try again.';
      return false;
    }
  }
  const library = createSceneLibrary(world, ko, preferences, selectScene, save);
  function live() {
    previewOffset = 0;
    previewUntil = 0;
    preview.hidden = true;
    delete root.dataset.preview;
    root
      .querySelector('[data-clock-time]')
      ?.setAttribute('aria-label', ko ? '현재 시간' : 'Current time');
    world
      .querySelectorAll('[data-living-hour]')
      .forEach((b) => b.setAttribute('aria-pressed', 'false'));
    lastFrame = -Infinity;
  }
  world.querySelector('[data-living-live]')!.addEventListener('click', live);
  world.querySelectorAll<HTMLButtonElement>('[data-living-hour]').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const now = new Date(),
        selected = new Date(now);
      selected.setHours(Number(button.dataset.livingHour), now.getMinutes(), now.getSeconds(), 0);
      previewOffset = selected.getTime() - now.getTime();
      previewUntil = performance.now() + 20_000;
      preview.hidden = false;
      root.dataset.preview = 'true';
      lastFrame = -Infinity;
      root
        .querySelector('[data-clock-time]')
        ?.setAttribute('aria-label', ko ? '미리보기 시간' : 'Preview time');
      world
        .querySelectorAll('[data-living-hour]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      world.querySelector<HTMLDetailsElement>('.living-explore')!.open = false;
    });
  });
  function resize() {
    const rect = world.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    ratio = Math.min(
      devicePixelRatio || 1,
      1.5,
      Math.sqrt(2_400_000 / Math.max(1, width * height)),
    );
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    lastFrame = -Infinity;
  }
  new ResizeObserver(resize).observe(world);
  new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
    schedule();
  }).observe(root);
  function schedule() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (enabled && visible && !document.hidden) frame = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });
  window.addEventListener('pageshow', schedule);
  reduced.addEventListener('change', () => {
    lastFrame = -Infinity;
    schedule();
  });
  function draw(date: Date) {
    if (!render) return;
    context!.save();
    try {
      render({
        context: context!,
        width,
        height,
        ratio,
        date,
        reducedMotion: reduced.matches,
        ko,
        world,
      });
    } finally {
      context!.restore();
    }
    const key = `${scene.id}:${Math.floor(date.getTime() / 1000)}`;
    if (key !== lastLabel) {
      lastLabel = key;
      const t = livingTime(date);
      phase.textContent =
        scene.presentation === 'words'
          ? ko
            ? '빛나는 글자로 읽는 시간'
            : 'Read the illuminated words'
          : (ko
              ? {
                  dawn: '빛이 스며드는 아침',
                  day: '느긋한 낮',
                  dusk: '따뜻한 노을',
                  night: '고요한 밤',
                }
              : {
                  dawn: 'A softer morning',
                  day: 'An unhurried day',
                  dusk: 'The golden hour',
                  night: 'A quiet night',
                })[t.phase];
      const details = scene.details(date, ko);
      world
        .querySelectorAll('.living-legend small')
        .forEach((el, i) => (el.textContent = details[i]!));
    }
  }
  function loop(timestamp: number) {
    if (!enabled || document.hidden || !visible) {
      frame = 0;
      return;
    }
    if (previewUntil && timestamp >= previewUntil) live();
    const interval = reduced.matches ? 1000 : width < 600 ? 50 : 1000 / 30;
    if (width && height && timestamp - lastFrame >= interval) {
      lastFrame = timestamp;
      draw(currentDate());
    }
    frame = requestAnimationFrame(loop);
  }
  // Restore only a known scene. A failed optional asset falls back to the island.
  void selectScene(preferences.selected).then((success) => {
    if (!success && !render) void selectScene('isle');
  });
  return {
    date: currentDate,
    setEnabled(value: boolean) {
      enabled = value;
      world.hidden = !value;
      root.classList.toggle('is-living', value);
      if (!value) {
        live();
        library.close();
      } else resize();
      schedule();
    },
  };
}
