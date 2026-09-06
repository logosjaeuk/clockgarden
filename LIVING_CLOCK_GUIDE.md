# Living Clock 씬 추가 가이드

이 문서가 Living Clock 작업의 단일 시작점이다. 웹페이지 전체를 재분석하지 말고 이 계약에 따라 새 씬을 구현한 뒤 변경된 화면만 검증한다. 현재 계약: 2026-09-06, 씬 레지스트리 + 공유 렌더 루프 + 검색형 라이브러리.

## 제품과 공통 UI

Clock Garden은 Astro + TypeScript 정적 사이트다. 영어 `/`, `/clock/`와 한국어 `/ko/`, `/ko/clock/`에서 같은 ClockTool을 사용한다. `?view=living`으로 Living Clock을 열고 `?view=digital`로 숫자 시계를 연다. 배포 대상은 기존 GitHub `logosjaeuk/clockgarden`과 Cloudflare 파이프라인이며 씬 추가 시 배포 설정은 수정하지 않는다.

모든 씬은 동일한 시계 프레임 안에서 동작한다. 위쪽 왼편은 씬 이름/시간대 분위기, 오른편은 **씬 둘러보기**, 위 중앙은 실제 시간/날짜/시간대, 중앙은 씬, 아래는 시간 범례와 하루 미리보기, 맨 아래는 숫자 시계 전환/화면 켜두기/전체 화면이다. 씬별로 메뉴를 추가하거나 내비게이션을 이동하지 않는다. 전체 화면을 지원하지 않는 브라우저에서는 기존 컨트롤 정책을 따른다.

- 자연스러운 청록/남색 풍경, 따뜻한 아이보리 글자, 은은한 조명. 공통 버튼은 반투명 남색과 아이보리 선택 상태.
- 바깥 프레임은 사이트의 22px 반경을 사용한다. 씬 안에 불필요하게 굵은 액자/대시보드 패널을 추가하지 않는다.
- 라이브러리는 사이트의 밝은 세이지/아이보리 표면, 제목, 검색, 전체/즐겨찾기/자연/집중/미니멀 필터, 카드, 결과 수, 더 보기로 구성된다. 제목/검색은 고정되고 카드 영역만 스크롤한다.
- 24개부터 표시하고 더 보기마다 24개씩 공개한다. 실제 등록 개수만 표시한다. 100개가 된다고 100개의 메뉴 버튼을 씬 위에 늘어놓지 않는다.
- 모달은 네이티브 `dialog.showModal()`을 사용한다. Tab 포커스 제한, Escape 닫기, 닫은 뒤 트리거 포커스 복귀를 유지한다. 즐겨찾기와 선택은 각각 별도 버튼이며 중첩 버튼을 만들지 않는다.
- 검색은 영문/한글 이름, 설명, 키워드를 함께 검색한다. 공백으로 나눈 모든 검색어가 일치해야 한다. 카테고리와 즐겨찾기 필터를 함께 적용한다.

## 파일 지도 — 전체 사이트를 읽을 필요가 없다

| 파일                                | 책임                                                               | 새 씬에서 보통 수정?        |
| ----------------------------------- | ------------------------------------------------------------------ | --------------------------- |
| `src/lib/scene-catalog.ts`          | 씬 타입, 레지스트리, 메타데이터, lazy loader, 검색/저장값 검증     | **항상: 등록 한 개**        |
| `src/scripts/living-새이름.ts`      | 새 씬 renderer 또는 async asset loader                             | **항상: 새 파일**           |
| `src/scripts/living-clock.ts`       | 공유 시각, preview, RAF, resize, visibility, 클래스/범례/선택 복원 | 보통 아니오                 |
| `src/components/SceneLibrary.astro` | 레지스트리에서 자동 생성하는 카드/필터/검색 모달                   | 아니오                      |
| `src/scripts/scene-library.ts`      | 검색, 즐겨찾기, 더 보기, 포커스, 실패 안내                         | 아니오                      |
| `src/components/LivingClock.astro`  | 공유 canvas, Word Clock DOM, 범례, preview                         | DOM 씬에만 필요할 수 있음   |
| `src/styles/living-clock.css`       | 공통 shell, 라이브러리, Word/illustration 반응형                   | 새 썸네일 또는 DOM 스타일만 |
| `src/lib/living-time.ts`            | supplied Date에서 하루 밝기/위상/분/초 계산                        | 아니오                      |
| `src/scripts/tools.ts`              | 숫자 시계, fullscreen, wake lock, Living mode 진입                 | 아니오                      |
| `public/scenes/<id>/`               | 씬별 배포용 이미지 등 정적 자산                                    | 자산이 있으면 추가          |
| `src/lib/scene-catalog.test.ts`     | 137개 모의 카탈로그, 검색/필터/저장값 검사                         | 계약 변경 시                |

`living-isle.ts`는 기존 등불섬 renderer를 그대로 분리한 것이다. 자연 씬 예시는 `living-aquarium.ts`, 이미지 기반 씬 예시는 `living-study.ts`, DOM 기반 예시는 `living-words.ts`다.

## 정확한 renderer 계약

```ts
interface SceneFrame {
  context: CanvasRenderingContext2D;
  width: number; // CSS pixels, shared world width
  height: number; // CSS pixels, shared world height
  ratio: number; // backing-store DPR, already capped
  date: Date; // the ONLY source of current/preview time
  reducedMotion: boolean;
  ko: boolean;
  world: HTMLElement; // for a scene-owned DOM layer only
}
type SceneRenderer = (frame: SceneFrame) => void;
```

renderer는 동기적으로 한 프레임을 그린다. loader는 `Promise<SceneRenderer>`를 반환한다. 이미지 decode 같은 비동기 준비는 loader에서 끝낸다. 모듈 최상위에서는 `window`, `document`, `Image`에 접근하지 않는다. Astro 빌드에서도 레지스트리를 읽기 때문이다.

새 캔버스 씬의 최소 골격:

```ts
// src/scripts/living-rain-window.ts
import type { SceneRenderer } from '../lib/scene-catalog';
import { livingTime } from '../lib/living-time';

export const renderRainWindow: SceneRenderer = ({
  context: c,
  width,
  height,
  ratio,
  date,
  reducedMotion,
}) => {
  const t = livingTime(date);
  const motion = reducedMotion ? 0 : date.getTime() / 1000;
  c.setTransform(ratio, 0, 0, ratio, 0, 0);
  c.fillStyle = t.daylight > 0.4 ? '#31586a' : '#102539';
  c.fillRect(0, 0, width, height);
  // Replace this small example with finished artwork. Keep real time semantics.
  c.fillStyle = '#f1dbab';
  c.beginPath();
  c.arc(width / 2 + Math.sin(motion / 8) * 3, height * 0.55, 12, 0, Math.PI * 2);
  c.fill();
};
```

`scenes` 배열에 다음 형태의 항목을 추가한다. 기존 항목의 ID를 바꾸지 않는다. 이 예시를 제품에 미완성 상태로 등록하지 말고 완성된 renderer/카피로 대체한다.

```ts
{
  id: 'rain-window',
  name: { en: 'Rain Window', ko: '비 오는 창가' },
  description: { en: 'A quiet window in the rain.', ko: '빗소리가 떠오르는 고요한 창가.' },
  category: 'focus', // nature | focus | minimal
  keywords: 'rain window cozy 비 창문 아늑',
  artwork: 'rain-window', // CSS .scene-artwork-rain-window
  symbol: '☂',
  presentation: 'landscape', // landscape | words | illustration
  legend: [
    { en: 'Sky', ko: '하늘' },
    { en: 'Minutes', ko: '분' },
    { en: 'Seconds', ko: '초' },
  ],
  details: (date, ko) => [
    ko ? '하루 24시간' : 'a 24-hour day',
    `${date.getMinutes()} ${ko ? '분' : 'min'}`,
    `${date.getSeconds()} ${ko ? '초' : 's'}`,
  ],
  load: async () => (await import('../scripts/living-rain-window')).renderRainWindow,
}
```

등록하면 카드, 검색, 선택 상태, 레이블, 범례가 자동으로 생긴다. `living-clock.ts`에 ID별 if/else를 추가하지 않는다. `artwork`에 대응하는 `.scene-artwork-<name>` 배경만 CSS에 추가한다. 이미지 썸네일은 대략 480px 너비 WebP를 권장한다. 카드에 애니메이션/전체 renderer를 구동하지 않는다.

`presentation`은 공통 안전 영역을 선택한다. `landscape`는 일반 자연 씬, `illustration`은 작게 정리한 상단 숫자와 모바일 680px 프레임, `words`는 기존 격자 전용이다. 새로운 DOM 씬을 `words`로 위장하지 말고 필요하면 명시적인 presentation 계약과 자기 DOM 레이어를 추가한다. 일반 canvas 씬에는 새 HTML이 필요 없다.

## 시간·수명·성능 규칙

1. 모든 시계와 움직임은 전달된 `date`를 사용한다. renderer 안에서 `Date.now()`/`new Date()`로 현재 시간을 따로 읽거나 frame 누적으로 위치를 계산하지 않는다.
2. `livingTime(date)`의 daylight/phase는 예술적인 하루의 밝기다. 실제 기상/천문 API가 아니다. 별도 서버나 위치 권한이 필요 없다.
3. 상단 숫자, 단어 격자, 탁상시계, 창밖은 동일한 실제/preview date를 따른다. preset은 시만 바꾸고 분·초를 유지한다. 20초 뒤 자동 복귀하며 사용자가 즉시 현재 시간으로 돌아갈 수도 있다.
4. RAF는 controller 한 개만 사용한다. 탭 숨김/뷰포트 밖에서는 정지, 다시 보이면 현재 date에서 재개한다. desktop 최대 30fps, 작은 화면 최대 20fps, reduced motion 1fps다.
5. reduced motion이면 장식적 움직임의 time을 0으로 고정한다. 실제 초/분/하루 변화는 유지한다. 별도 CSS animation이나 setInterval을 만들지 않는다.
6. canvas backing pixels는 최대 240만, DPR 최대 1.5다. canvas 크기를 renderer가 직접 변경하지 않는다. 매 프레임 화면을 채우고 `setTransform`으로 좌표계를 시작한다.
7. `save/restore`를 쌍으로 사용한다. controller가 추가로 프레임을 감싸지만 renderer의 불균형한 save는 안전하지 않다. alpha/clip/dash를 다음 씬에 누출하지 않는다.
8. renderer/이미지는 선택 시 lazy load한다. 성공하기 전에는 이전 씬을 유지하며, 실패하면 라이브러리에 재시도 안내가 나온다. 최근 renderer 최대 4개만 유지하므로 이미지가 100개 누적되지 않는다.
9. 저장 키 `cg-scenes-v1`: `{ selected: string, favorites: string[] }`. ID 존재 여부를 검증하고 중복/잘못된 데이터는 제거한다. storage가 차단돼도 메모리에서 동작한다. `mg-living`은 기존 Living/숫자 모드 값이다.
10. 선택 경쟁은 request token으로 처리한다. 이전 async load가 나중 선택을 덮어쓰면 안 된다. asset loader에서 서버 요청/추적/소리 자동재생을 추가하지 않는다.

## 안전 영역과 반응형

좌표는 scene world 기준이다. 일반 높이는 `clamp(610px, 78vh, 820px)`, 580px 이하 자연 씬은 560px, Word는 650px, illustration은 680px다. 전체 화면은 `100dvh`.

- 위 0–65px: 이름/분위기/라이브러리 버튼. 위 70–210px: 일반 씬 숫자/날짜/시간대. 중요한 피사체나 시계는 이 영역과 겹치지 않게 설계한다.
- 일반 씬의 아래 130px, 모바일 아래 약 170px는 범례/미리보기/컨트롤 영역이다. 미리보기 메뉴는 위로 펼쳐지며 모달은 top layer다.
- illustration은 작은 숫자 overlay를 사용한다. Quiet Study 모바일은 위 150px/아래 145px를 남기고 중앙에 이미지를 자르되 캐릭터 얼굴과 탁상시계를 함께 보존한다.
- 모바일 컨트롤 최소 터치 크기는 44px다. 영문 긴 글자도 컨테이너 안에서 줄바꿈되어야 한다.
- 매우 낮은 가로 전체 화면에서도 숫자/피사체/하단 버튼 겹침을 검사한다. 단순히 세로 모바일 스타일을 재사용하지 않는다.
- nav 버튼은 공통 상단 오른쪽을 유지한다. 씬 안으로 떠다니는 개별 Scenes 버튼은 이전 방식이며 재도입하지 않는다.

## 현재 4개 씬의 의미와 주의점

| ID            | 표현                   | 시간 의미 / 유지할 기능                                                                                                                                                                               |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isle`        | Canvas 자연 풍경       | 하늘·해/달=하루, 등불 60개=분, 배 한 바퀴=초. 배/물결을 섬 건물보다 먼저 그려 지붕 위를 지나지 않게 한다.                                                                                             |
| `aquarium`    | Canvas 수족관          | 물빛=하루, 산호 빛=분, 흰동가리 공전=60초. 장식 물고기는 외곽에서만 wrap하고 산호/전경과 경로를 구분한다.                                                                                             |
| `words`       | DOM/SVG 격자           | 영어 18×16/한국어 6열. 모든 단어/분 기능, 캡션, AM/PM, 상단 시간·날짜·시간대, 초 진행 테두리를 유지한다. 영어 중복 단어의 위치는 별도다. `word-matrix.test.ts`가 1,440개 시각을 검사한다.             |
| `quiet-study` | 일러스트 + Canvas 합성 | 그림 속 탁상시계는 실제 시·분·초, 날짜. 창밖 하늘/달/별/도시 불빛과 방 밝기는 하루에 따라 변한다. 김·구름·별의 빛은 장식 애니메이션. 인물 자체는 정지 일러스트이며 프레임 애니메이션 캐릭터가 아니다. |

## Quiet Study 자산과 재생성

- `public/scenes/quiet-study/room.webp`: 1536×1024, 약 211KB.
- `public/scenes/quiet-study/thumbnail.webp`: 480px 너비, 약 21KB.
- 사용자 제공 그림을 내장 **image_gen**으로 수정했다. 별도 API/CLI/MCP/외부 폰트가 필요하지 않았다. 최적화는 기존 sharp를 이용한 WebP 인코딩이다.
- 시계 숫자/문구/달력은 이미지에서 제거했다. 코드가 빈 시계 화면에 실제 시간을 쓴다. 정적인 날짜/시각이 그림에 남으면 안 된다.
- renderer는 원본 이미지 좌표를 사용한다. 탁상시계 중심 `(1275, 605)`, 오른쪽 창문 대략 `(983, 0)`–`(1254, 482)`이며 식물/창틀을 피하는 clip path다. 이미지 구도를 바꾸면 mask, 시계 위치, 모바일 crop도 함께 바꿔야 한다.
- PNG 원본은 개발자 로컬 generated_images에 남아 있고 사이트는 위 WebP 두 파일만 사용한다. 임시 경로를 코드에서 참조하지 않는다.

사용한 이미지 생성 프롬프트(내장 도구, 사용자 제공 두 번째 이미지를 edit target으로 사용):

> Edit this supplied illustration into a production background asset for Clock Garden's interactive Quiet Study clock scene. Preserve the exact 1536x1024 composition and camera framing, girl, face, clothes, books, mug, cat, plants, furniture, window frames and desk clock casing. Warm hand-painted anime illustration, detailed cozy study-room. Change ONLY: (1) remove all printed numbers, letters, symbols and leaf icon from the desk clock's dark display, leaving a clean blank dark screen for runtime clock digits; (2) replace dated calendar and all written posters/book-spine/mug slogans with tasteful blank paper or small botanical drawings without readable text; (3) make the outdoor scenery seen inside the RIGHT window pane (roughly x980..1254, y0..485) a calm clear blue sky over a distant softly painted city, maintain the exact window geometry. Keep the room warm but neutral daylight so runtime evening tint can be added. No new UI overlays, no watermark, no border. This is a raster background for a real functioning web scene, not a mockup.

## 새 씬 추가 순서와 완료 검사

1. `git status -sb`, 원격 최신 확인. 사용자 변경은 보존한다.
2. 이 문서를 읽고 renderer 파일, registry 항목, 필요한 자산/썸네일만 추가한다. 대규모 재분석이나 Cloudflare 설정 변경을 하지 않는다.
3. `npm run dev -- --host 127.0.0.1`에서 `/?view=living` 또는 `/ko/?view=living`로 진입한다. 라이브러리로 새 씬을 선택한다.
4. Desktop 1440×900, Tablet 768×1024, Mobile 390×844 및 최소 폭 320px에서 씬/라이브러리/검색/빈 결과를 확인한다. 영어와 한국어를 모두 확인한다.
5. 검색→카테고리→즐겨찾기→닫기/Escape→재열기→새로고침 후 선택 복원을 확인한다. 기존 세 씬 왕복과 숫자 시계 복귀, 지원 환경의 fullscreen을 확인한다.
6. 새벽/한낮/노을/한밤을 선택해 같은 시각이 모든 표현에 적용되는지, 20초 자동 복귀와 수동 복귀가 되는지 확인한다. 한 프레임만 보고 초 움직임/하루 변화가 동작한다고 주장하지 않는다.
7. `npm run lint`, `npm test`, `npm run build`를 실행한다. lint와 build에 Astro/TypeScript check가 포함된다. 추가한 renderer 오류, 콘솔 오류, 잘못된 자산 경로를 해결한다.
8. `git diff --check`와 변경사항 검토. 자산/문서/코드만 commit한다. 빌드 출력, 로그, 키, 임시파일은 제외한다. 사용자 요청에 push가 포함됐다면 기존 origin에 push하고 원격 SHA를 확인한다.
9. 최종 결과에 실제 검증 범위와 제한을 적는다. 실제 iOS/Safari/배터리나 프로덕션 배포를 확인하지 않았다면 통과했다고 쓰지 않는다.

앞으로 사용자에게는 “`LIVING_CLOCK_GUIDE.md`를 읽고 [새 씬 설명]을 추가해줘”만 요청하면 된다. 새로운 공통 계약을 바꿨다면 반드시 이 문서도 같은 커밋에서 갱신한다.
