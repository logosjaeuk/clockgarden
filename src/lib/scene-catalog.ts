export type SceneCategory = 'nature' | 'focus' | 'minimal';
export type Localized = { en: string; ko: string };
export interface SceneFrame {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  ratio: number;
  date: Date;
  reducedMotion: boolean;
  ko: boolean;
  world: HTMLElement;
}
export type SceneRenderer = (frame: SceneFrame) => void;
export interface SceneDefinition {
  id: string;
  name: Localized;
  description: Localized;
  category: SceneCategory;
  keywords: string;
  artwork: string;
  symbol: string;
  presentation: 'landscape' | 'words' | 'illustration';
  legend: [Localized, Localized, Localized];
  details: (date: Date, ko: boolean) => [string, string, string];
  load: () => Promise<SceneRenderer>;
}
const l = (en: string, ko: string): Localized => ({ en, ko });
export const sceneCategories = [
  { id: 'all', name: l('All scenes', '전체') },
  { id: 'favorites', name: l('Favorites', '즐겨찾기') },
  { id: 'nature', name: l('Nature', '자연') },
  { id: 'focus', name: l('Focus', '집중') },
  { id: 'minimal', name: l('Minimal', '미니멀') },
] as const;
const landscapeDetails = (d: Date, ko: boolean): [string, string, string] => [
  ko ? '하루 24시간' : 'a 24-hour day',
  ko
    ? `${d.getMinutes()}개 · ${d.getMinutes()}분`
    : `${d.getMinutes()} lit · ${d.getMinutes()} min`,
  ko ? `한 바퀴 60초 · ${d.getSeconds()}초` : `60s per lap · ${d.getSeconds()}s`,
];
// One registration creates the library card, search entry, labels and lazy loader.
export const scenes: SceneDefinition[] = [
  {
    id: 'rainlight',
    name: l('Rainlight', '비 오는 창가'),
    description: l(
      'Rain on the glass. Somewhere warm to stay.',
      '비 내리는 도시와 따뜻한 불빛, 잠시 머무는 창가.',
    ),
    category: 'focus',
    keywords: 'rain window lamp cozy city illustration 비 창문 조명 도시 일러스트 휴식',
    artwork: 'rainlight',
    symbol: '☂',
    presentation: 'illustration',
    legend: [l('Outside', '창밖'), l('Rain', '빗방울'), l('Lamplight', '스탠드')],
    details: (_d, ko) => [
      ko ? '하루를 따라 변하는 빛' : 'light follows the day',
      ko ? '유리 위를 흐르는 비' : 'gently down the glass',
      ko ? '밤이면 더 따뜻하게' : 'warmer after dusk',
    ],
    load: async () => (await import('../scripts/living-rainlight')).loadRainlight(),
  },
  {
    id: 'chrono-garden',
    name: l('Chrono Garden', '시간의 정원'),
    description: l('A garden that blossoms with time.', '시간에 맞춰 피고 지는 원형 꽃의 정원.'),
    category: 'nature',
    keywords: 'chrono garden flower bloom firefly 정원 꽃 개화 반딧불 시간',
    artwork: 'garden',
    symbol: '✿',
    presentation: 'landscape',
    legend: [l('24 beds', '24구역'), l('Bloom', '개화'), l('Firefly', '반딧불')],
    details: (d, ko) => [
      ko ? `${d.getHours()}시 구역` : `hour ${d.getHours()} of 24`,
      ko
        ? `${d.getMinutes()}분 · ${d.getMinutes() + 1}/60단계`
        : `${d.getMinutes()} min · ${d.getMinutes() + 1}/60`,
      ko ? `60초 한 바퀴 · ${d.getSeconds()}초` : `60s orbit · ${d.getSeconds()}s`,
    ],
    load: async () => (await import('../scripts/living-garden')).renderChronoGarden,
  },
  {
    id: 'isle',
    name: l('Lantern Isle', '등불섬'),
    description: l('A little island. An unhurried day.', '등불과 작은 배가 시간을 전하는 섬.'),
    category: 'nature',
    keywords: 'island sky ferry 섬 하늘 배',
    artwork: 'isle',
    symbol: '◒',
    presentation: 'landscape',
    legend: [l('Sky', '하늘'), l('Lanterns', '등불'), l('Little ferry', '작은 배')],
    details: landscapeDetails,
    load: async () => {
      const { drawIsle } = await import('../scripts/living-isle');
      return (f) => drawIsle(f.context, f.width, f.height, f.ratio, f.date, f.reducedMotion);
    },
  },
  {
    id: 'aquarium',
    name: l('Deep Aquarium', '심해 수족관'),
    description: l('Drifting fish and a soft coral glow.', '물고기의 유영과 은은한 산호의 빛.'),
    category: 'nature',
    keywords: 'aqua water ocean fish 물 바다 물고기',
    artwork: 'aquarium',
    symbol: '≈',
    presentation: 'landscape',
    legend: [l('Water', '물빛'), l('Coral lights', '빛 산호'), l('Clownfish', '흰동가리')],
    details: landscapeDetails,
    load: async () => {
      const { drawAquarium } = await import('../scripts/living-aquarium');
      return (f) => drawAquarium(f.context, f.width, f.height, f.ratio, f.date, f.reducedMotion);
    },
  },
  {
    id: 'words',
    name: l('Word Clock', '격자 시계'),
    description: l('The present, written in light.', '빛나는 글자로 읽는 지금 이 순간.'),
    category: 'minimal',
    keywords: 'letters typography word 글자 단어',
    artwork: 'words',
    symbol: 'Aa',
    presentation: 'words',
    legend: [l('Letters', '글자'), l('Minutes', '분'), l('Seconds', '초')],
    details: (d, ko) => [
      ko ? '빛으로 읽는 시간' : 'illuminated time',
      ko ? `${d.getMinutes()}분의 단어` : `${d.getMinutes()} min in words`,
      ko ? `가장자리 빛 · ${d.getSeconds()}초` : `edge glow · ${d.getSeconds()}s`,
    ],
    load: async () => {
      const { renderWords } = await import('../scripts/living-words');
      return (f) => renderWords(f.world, f.date, f.ko);
    },
  },
  {
    id: 'quiet-study',
    name: l('Quiet Study', '고요한 서재'),
    description: l(
      'Your desk, a warm lamp, a changing sky.',
      '따뜻한 책상 위 시계와 시시각각 변하는 창밖.',
    ),
    category: 'focus',
    keywords: 'lofi girl anime illustration desk room study 공부 소녀 애니 일러스트 방 책상',
    artwork: 'study',
    symbol: '☕',
    presentation: 'illustration',
    legend: [l('Window', '창밖'), l('Desk clock', '탁상시계'), l('Atmosphere', '분위기')],
    details: (_d, ko) => [
      ko ? '하루의 빛과 하늘' : 'the light of your day',
      ko ? '실제 시·분·초' : 'live hours, minutes & seconds',
      ko ? '잔잔한 빛과 김' : 'soft light & rising steam',
    ],
    load: async () => (await import('../scripts/living-study')).loadStudy(),
  },
];

export const SCENE_PAGE_SIZE = 24;
export function filterScenes(
  catalog: readonly SceneDefinition[],
  query: string,
  category: string,
  favorites: readonly string[],
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return catalog.filter((s) => {
    if (
      category === 'favorites'
        ? !favorites.includes(s.id)
        : category !== 'all' && category !== s.category
    )
      return false;
    const text =
      `${s.name.en} ${s.name.ko} ${s.description.en} ${s.description.ko} ${s.keywords}`.toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
export function readScenePreferences(value: unknown, catalog: readonly SceneDefinition[] = scenes) {
  const valid = new Set(catalog.map((s) => s.id));
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    selected:
      typeof record.selected === 'string' && valid.has(record.selected) ? record.selected : 'isle',
    favorites: Array.isArray(record.favorites)
      ? [
          ...new Set(
            record.favorites.filter((id): id is string => typeof id === 'string' && valid.has(id)),
          ),
        ]
      : [],
  };
}
