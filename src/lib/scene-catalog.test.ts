import { describe, expect, it } from 'vitest';
import { filterScenes, readScenePreferences, scenes, SCENE_PAGE_SIZE } from './scene-catalog';

describe('Living Clock catalog at collection scale', () => {
  const largeCatalog = Array.from({ length: 137 }, (_, i) => ({
    ...scenes[i % scenes.length]!,
    id: `scene-${i}`,
    keywords: `unique-${i}`,
  }));
  it('keeps all 137 scenes reachable in bounded pages without duplicates', () => {
    const matches = filterScenes(largeCatalog, '', 'all', []);
    const visited = [];
    for (let offset = 0; offset < matches.length; offset += SCENE_PAGE_SIZE) {
      const page = matches.slice(offset, offset + SCENE_PAGE_SIZE);
      expect(page.length).toBeLessThanOrEqual(24);
      visited.push(...page.map((s) => s.id));
    }
    expect(visited).toHaveLength(137);
    expect(new Set(visited).size).toBe(137);
    expect(filterScenes(largeCatalog, 'unique-136', 'all', []).map((s) => s.id)).toEqual([
      'scene-136',
    ]);
  });
  it('combines bilingual, multiword search with categories and favorites', () => {
    expect(filterScenes(scenes, '  LOFI 서재  ', 'focus', []).map((s) => s.id)).toEqual([
      'quiet-study',
    ]);
    expect(filterScenes(scenes, '서재', 'nature', [])).toEqual([]);
    expect(filterScenes(scenes, '', 'favorites', ['words']).map((s) => s.id)).toEqual(['words']);
    expect(filterScenes(scenes, 'no such scene', 'all', [])).toEqual([]);
  });
  it('rejects stale or corrupt saved preferences and deduplicates favorites', () => {
    expect(readScenePreferences(null)).toEqual({ selected: 'isle', favorites: [] });
    expect(
      readScenePreferences({
        selected: 'deleted-scene',
        favorites: ['words', 'words', null, 'missing'],
      }),
    ).toEqual({ selected: 'isle', favorites: ['words'] });
    expect(readScenePreferences({ selected: 'quiet-study', favorites: 'bad' })).toEqual({
      selected: 'quiet-study',
      favorites: [],
    });
  });
  it('requires unique stable registrations and bilingual metadata', () => {
    expect(new Set(scenes.map((s) => s.id)).size).toBe(scenes.length);
    for (const scene of scenes) {
      expect(scene.id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(scene.name.en).toBeTruthy();
      expect(scene.name.ko).toBeTruthy();
      expect(scene.legend).toHaveLength(3);
      for (const hour of [0, 6, 12, 18, 23]) {
        expect(scene.details(new Date(2026, 8, 6, hour, 59, 59), true)).toHaveLength(3);
      }
    }
  });
});
