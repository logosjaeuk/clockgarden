import { filterScenes, SCENE_PAGE_SIZE, scenes } from '../lib/scene-catalog';

export function createSceneLibrary(
  world: HTMLElement,
  ko: boolean,
  preferences: { selected: string; favorites: string[] },
  select: (id: string) => Promise<boolean>,
  save: () => void,
) {
  const dialog = world.querySelector<HTMLDialogElement>('[data-scene-library]')!;
  const trigger = world.querySelector<HTMLButtonElement>('[data-library-open]')!;
  const search = dialog.querySelector<HTMLInputElement>('[data-scene-search]')!;
  const cards = Array.from(dialog.querySelectorAll<HTMLElement>('[data-scene-card]'));
  const more = dialog.querySelector<HTMLButtonElement>('[data-scene-more]')!;
  let category = 'all';
  let limit = SCENE_PAGE_SIZE;
  let loading = false;
  function update() {
    const matches = filterScenes(scenes, search.value, category, preferences.favorites);
    const shown = new Set(matches.slice(0, limit).map((s) => s.id));
    cards.forEach((card) => {
      const id = card.dataset.sceneCard!;
      card.hidden = !shown.has(id);
      const favorite = card.querySelector<HTMLButtonElement>('[data-scene-favorite]')!;
      const saved = preferences.favorites.includes(id);
      favorite.setAttribute('aria-pressed', String(saved));
      favorite.textContent = saved ? '★' : '☆';
      const selected = id === preferences.selected;
      card.querySelector('[data-scene]')!.setAttribute('aria-pressed', String(selected));
      card.querySelector('[data-scene-selection]')!.textContent = selected
        ? ko
          ? '지금 머무는 곳 ✓'
          : 'Your current scene ✓'
        : ko
          ? '이 씬에서 쉬기 →'
          : 'Settle in →';
    });
    dialog.querySelector<HTMLElement>('[data-scene-results]')!.textContent = ko
      ? `${matches.length}개 씬 · ${Math.min(limit, matches.length)}개 표시`
      : `${matches.length} scenes · showing ${Math.min(limit, matches.length)}`;
    dialog.querySelector<HTMLElement>('[data-scene-empty]')!.hidden = matches.length > 0;
    more.hidden = matches.length <= limit;
    dialog
      .querySelectorAll<HTMLElement>('[data-scene-category]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.sceneCategory === category)),
      );
  }
  trigger.addEventListener('click', () => {
    update();
    dialog.showModal();
    search.focus();
  });
  dialog.querySelector('[data-library-close]')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger.focus());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
  search.addEventListener('input', () => {
    limit = SCENE_PAGE_SIZE;
    update();
  });
  more.addEventListener('click', () => {
    limit += SCENE_PAGE_SIZE;
    update();
  });
  dialog.querySelector('[data-scene-reset]')!.addEventListener('click', () => {
    category = 'all';
    search.value = '';
    limit = SCENE_PAGE_SIZE;
    update();
    search.focus();
  });
  dialog.querySelectorAll<HTMLButtonElement>('[data-scene-category]').forEach((button) =>
    button.addEventListener('click', () => {
      category = button.dataset.sceneCategory!;
      limit = SCENE_PAGE_SIZE;
      update();
    }),
  );
  dialog.querySelectorAll<HTMLButtonElement>('[data-scene-favorite]').forEach((button) =>
    button.addEventListener('click', () => {
      const id = button.dataset.sceneFavorite!;
      const index = preferences.favorites.indexOf(id);
      if (index >= 0) preferences.favorites.splice(index, 1);
      else preferences.favorites.push(id);
      save();
      update();
      if (category === 'favorites' && index >= 0) search.focus();
    }),
  );
  dialog.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((button) =>
    button.addEventListener('click', async () => {
      if (loading) return;
      loading = true;
      dialog.setAttribute('aria-busy', 'true');
      dialog.querySelector<HTMLElement>('[data-scene-results]')!.textContent = ko
        ? '풍경을 준비하고 있어요…'
        : 'Preparing your scene…';
      const success = await select(button.dataset.scene!);
      loading = false;
      dialog.removeAttribute('aria-busy');
      if (success) {
        update();
        dialog.close();
      } else
        dialog.querySelector<HTMLElement>('[data-scene-results]')!.textContent = ko
          ? '불러오지 못했습니다. 다시 선택해 주세요.'
          : 'Could not load this scene. Please try again.';
    }),
  );
  return {
    close: () => {
      if (dialog.open) dialog.close();
    },
  };
}
