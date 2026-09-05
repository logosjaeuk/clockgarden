# Clock Garden

[English](#minute-glass) · [한국어](#minute-glass-한국어)

Clock Garden is a fast, static, bilingual time utility with a live clock, stopwatch, countdown timer, multi-alarm clock, world clock, and time-zone converter. It has no account, database, or persistent application server.

## Architecture

- **Astro + strict TypeScript** generates fully static, crawlable HTML.
- **Vanilla TypeScript islands** activate only the current tool. There is no client framework or hydration runtime.
- `src/lib/` separates testable time calculations, IANA timezone conversion, alarm scheduling, persistence, sound, and optional analytics.
- English uses canonical root routes; Korean uses `/ko/`. Copy and route helpers are centralized, so more locales can be added without duplicating application logic.
- User preferences, alarm definitions, and world-clock locations use defensive `localStorage` wrappers. Stopwatch state stays in memory; countdown deadlines survive refresh/navigation in the same tab using sessionStorage. Named timer presets and converter zone combinations are saved locally.
- A small service worker caches visited pages and assets; offline support requires a prior controlled visit. Uncached pages show a localized offline response. The manifest and SVG icon make the site installable where supported.

Timing behavior is deadline-based: the clock and timer derive their display from the current system timestamp, while the stopwatch uses `performance.now()`. Animation callbacks render state but never define elapsed time.

## Commands

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

The production output is in `dist/`.

## Configuration

Copy `.env.example` to `.env` for local configuration. Set `PUBLIC_SITE_URL` to the final HTTPS origin during production builds; it controls canonical links, hreflang links, Open Graph URLs, and sitemap locations. The local fallback is `http://localhost:4321`, not a pretend production domain.

Optional variables:

- `PUBLIC_ANALYTICS_ENDPOINT`: receives privacy-conscious event beacons. Blank means no events are transmitted.
- `PUBLIC_GOOGLE_SITE_VERIFICATION`: adds the Search Console verification meta tag.
- `PUBLIC_ADS_ENABLED`: reserves the integration flag. No ads or third-party ad scripts are included by this repository.

Brand strings and these feature hooks are centralized in `src/config.ts`.

## Deployment

Run `npm run build` with `PUBLIC_SITE_URL` set, then deploy the `dist/` directory to any static CDN.

For Cloudflare Pages use:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `PUBLIC_SITE_URL=https://your-real-domain`

The project is not coupled to Cloudflare; Netlify, GitHub Pages (at an origin root), S3/CDN, and similar static hosts work too. Configure the host to serve `404.html` for missing routes and apply production security headers where the platform supports them. A suitable starting Content Security Policy is:

```text
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; connect-src 'self' <analytics-endpoint-if-used>; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

The inline allowance covers static JSON-LD and an early theme preference script. A deployment with an edge nonce pipeline can tighten this further.

## Localization

English and Korean production copy live in `src/content/toolPages.ts`, shared navigation copy in `src/i18n.ts`, and locale-sensitive date/number output uses `Intl`.

To add a language:

1. Add the locale type and copy entries.
2. Add a localized dynamic route and localized home/privacy pages following `src/pages/ko/`.
3. Extend `pathFor()` and the `hreflang` links in `BaseLayout.astro`.
4. Add only reviewed, production-quality translations to the sitemap.

Do not generate thin translated or city pages.

## Adding a tool

1. Put pure calculations in `src/lib/` and cover edge cases with Vitest.
2. Add a semantic Astro component in `src/components/` so the initial shell works without JavaScript.
3. Add a small initializer in `src/scripts/tools.ts`; keep rendering separate from timing state.
4. Add concise, unique English and Korean metadata and supporting copy to `toolPages.ts`.
5. Add the route to navigation, the service-worker shell, and tests for generated links and metadata.

## SEO

Each genuine tool has one English and one Korean page with unique title, meta description, H1, canonical, Open Graph/Twitter metadata, valid `WebApplication` structured data, and reciprocal hreflang. `sitemap.xml` is generated from the finite tool registry, while `robots.txt`, a noindex 404, crawlable navigation, and concise limitation copy are included. There are no generated city or keyword-doorway pages.

## Advertising and analytics

No ad provider, publisher ID, creative, or analytics vendor ships by default. `PUBLIC_ADS_ENABLED=false` maps to the centralized `ADS_DISABLED` state in `src/config.ts`; do not change it until the provider integration and launch review are complete.

The reviewed advertising structure is deliberately conservative:

- At most one optional region appears on a tool page, after the utility and all supporting content.
- The region is never inserted between a display and its controls, beside a button, or inside a form, list, navigation area, modal, or fullscreen experience.
- No advertising region is present on the home, privacy, or 404 pages.
- The region has a localized `Advertisements` / `광고` label and reserves 728 × 90 CSS pixels on wider screens or up to 320 × 100 CSS pixels on mobile to reduce layout shift.
- A second placement is intentionally not configured. Reconsider it only if a future page has substantially more original publisher content and a fresh policy/UX review supports it.

Enabling the flag exposes only the reviewed empty integration region; it does not load an ad. Before adding a provider script, update the Content Security Policy and both privacy notices, select and configure any regionally required consent platform, test that consent choices govern storage and requests, and repeat the desktop/mobile/dark-mode/fullscreen audit on the production domain. Do not enable advertising merely to preview the blank reservation in production.

The internal event vocabulary is defined in `src/lib/analytics.ts` and sends nothing unless an endpoint is configured.

## Browser limitations

- The live clock reflects the user's device clock; it is not NTP or atomic-clock synchronized.
- Web alarms and timer notifications cannot be guaranteed after a browser, tab, device, or OS suspends or terminates the page. Use a native alarm for critical reminders.
- Notification permission is requested only from a user action. Denial does not stop in-page operation.
- Sound can be blocked by browser autoplay policies until the user interacts with the page.
- Wake lock and fullscreen controls are hidden or degrade quietly when unsupported.
- The converter uses browser IANA data, rejects nonexistent local times and requires an explicit offset selection for repeated times. Shared result URLs preserve that selection. Keep browsers updated for current government time-zone rules.
- Clearing browser site data removes saved preferences, alarms, and world-clock locations.

## Quality checks

Vitest covers clock formats and rollovers, stopwatch pause/resume and lap statistics, timer deadlines and additions, IANA conversions and DST, half/quarter-hour offsets, weekday alarm recurrence, and snooze. `astro check` validates strict TypeScript and Astro templates. `npm run build` performs both checking and a production build.

Performance metrics remain `TBD_AFTER_BENCHMARK` until measured against the final production origin under representative network and device conditions. No Lighthouse, LCP, INP, or CLS claims are made in advance.

---

# Clock Garden 한국어

Clock Garden는 실시간 시계, 스톱워치, 카운트다운 타이머, 다중 알람, 세계 시계, 시간대 변환기를 제공하는 빠르고 정적인 이중 언어 시간 도구입니다. 계정, 데이터베이스 또는 상시 실행 애플리케이션 서버가 필요하지 않습니다.

## 아키텍처

- **Astro + 엄격한 TypeScript**로 검색 엔진이 읽을 수 있는 완전한 정적 HTML을 생성합니다.
- **바닐라 TypeScript 아일랜드**는 현재 사용하는 도구만 활성화합니다. 클라이언트 프레임워크나 하이드레이션 런타임이 없습니다.
- `src/lib/`에서 시간 계산, IANA 시간대 변환, 알람 스케줄링, 로컬 저장, 소리 및 선택적 분석 기능을 분리하여 테스트할 수 있습니다.
- 영어는 루트 경로를, 한국어는 `/ko/` 경로를 사용합니다. 문구와 경로 도우미를 중앙에서 관리하므로 애플리케이션 로직을 복제하지 않고 언어를 추가할 수 있습니다.
- 사용자 설정, 알람, 세계 시계 위치는 검증 절차가 포함된 `localStorage` 래퍼로 저장합니다. 스톱워치 상태는 메모리에 보관하며, 타이머는 탭의 sessionStorage로 새로고침 후 복원합니다. 이름 붙인 타이머와 변환기 시간대 조합도 로컬에 저장합니다.
- 작은 서비스 워커가 런타임 캐시 기반 오프라인 셸을 제공합니다. 매니페스트와 SVG 아이콘을 포함해 지원되는 환경에서 설치할 수 있습니다.

시간 동작은 콜백 횟수가 아닌 실제 기준 시각을 사용합니다. 시계와 타이머는 현재 시스템 타임스탬프에서 화면 값을 계산하고, 스톱워치는 `performance.now()`를 사용합니다. 애니메이션 콜백은 상태를 표시할 뿐 경과 시간을 결정하지 않습니다.

## 실행 명령어

Node.js 22.12 이상이 필요합니다.

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

프로덕션 결과물은 `dist/`에 생성됩니다.

## 환경 설정

로컬 설정이 필요하면 `.env.example`을 `.env`로 복사하세요. 프로덕션 빌드에서는 `PUBLIC_SITE_URL`을 실제 HTTPS 주소로 지정해야 합니다. 이 값은 canonical, hreflang, Open Graph 및 사이트맵 URL에 사용됩니다. 로컬 기본값은 가상의 프로덕션 도메인이 아닌 `http://localhost:4321`입니다.

선택적 환경 변수:

- `PUBLIC_ANALYTICS_ENDPOINT`: 개인정보를 최소화한 내부 이벤트를 받을 주소입니다. 비워 두면 어떤 이벤트도 전송하지 않습니다.
- `PUBLIC_GOOGLE_SITE_VERIFICATION`: Google Search Console 인증 메타 태그 값입니다.
- `PUBLIC_ADS_ENABLED`: 광고 연동을 위한 예약 설정입니다. 이 저장소에는 광고나 제3자 광고 스크립트가 포함되어 있지 않습니다.

브랜드 문구와 기능 설정은 `src/config.ts`에서 중앙 관리합니다.

## 배포

`PUBLIC_SITE_URL`을 지정한 상태에서 `npm run build`를 실행한 뒤 `dist/` 디렉터리를 정적 CDN에 배포합니다.

Cloudflare Pages 설정:

- 빌드 명령어: `npm run build`
- 출력 디렉터리: `dist`
- 환경 변수: `PUBLIC_SITE_URL=https://실제-도메인`

Cloudflare에 종속된 구조는 아닙니다. Netlify, GitHub Pages(도메인 루트 배포), S3/CDN 등 다른 정적 호스팅에서도 사용할 수 있습니다. 호스팅 서비스에서 존재하지 않는 경로에 `404.html`을 제공하고, 지원하는 경우 프로덕션 보안 헤더를 적용하세요. Content Security Policy 시작 예시는 다음과 같습니다.

```text
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; connect-src 'self' <analytics-endpoint-if-used>; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

인라인 허용은 정적 JSON-LD와 초기 테마 설정 스크립트에 사용합니다. 엣지 환경에서 nonce를 주입할 수 있다면 정책을 더 엄격하게 설정할 수 있습니다.

## 다국어 지원

영어와 한국어 프로덕션 문구는 `src/content/toolPages.ts`, 공통 탐색 문구는 `src/i18n.ts`에서 관리하며, 지역별 날짜와 숫자 표시는 `Intl`을 사용합니다.

새 언어를 추가하려면:

1. 로케일 타입과 번역 문구를 추가합니다.
2. `src/pages/ko/`를 참고하여 해당 언어의 동적 경로, 홈페이지 및 개인정보 처리방침 페이지를 추가합니다.
3. `pathFor()`와 `BaseLayout.astro`의 `hreflang` 링크를 확장합니다.
4. 검토가 완료된 고품질 번역 페이지만 사이트맵에 추가합니다.

내용이 빈약한 번역 페이지나 도시 페이지를 자동 생성하지 마세요.

## 새 도구 추가

1. 순수 계산 로직을 `src/lib/`에 작성하고 Vitest로 경계 조건을 테스트합니다.
2. JavaScript 없이도 초기 셸을 읽을 수 있도록 `src/components/`에 시맨틱 Astro 컴포넌트를 추가합니다.
3. `src/scripts/tools.ts`에 작은 초기화 함수를 추가하고 렌더링과 시간 상태를 분리합니다.
4. `toolPages.ts`에 고유하고 간결한 영어·한국어 메타데이터와 안내 문구를 추가합니다.
5. 탐색 메뉴와 서비스 워커 셸에 경로를 추가하고, 생성된 링크와 메타데이터를 테스트합니다.

## SEO

각 실제 도구는 영어 페이지와 한국어 페이지를 하나씩 제공합니다. 모든 페이지에 고유한 제목, 메타 설명, H1, canonical, Open Graph/X 메타데이터, 유효한 `WebApplication` 구조화 데이터와 상호 `hreflang`을 적용했습니다. `sitemap.xml`은 제한된 도구 목록에서 생성되며 `robots.txt`, noindex 404, 크롤링 가능한 탐색 메뉴와 간결한 제한 사항 설명을 포함합니다. 도시별 자동 생성 페이지나 키워드 도어웨이 페이지는 없습니다.

## 광고 및 분석

기본 상태에서는 광고 제공자, 게시자 ID, 광고 소재 또는 분석 업체를 사용하지 않습니다. `PUBLIC_ADS_ENABLED=false`는 `src/config.ts`의 중앙 `ADS_DISABLED` 상태로 연결됩니다. 광고 제공자 연동과 출시 검토가 끝날 때까지 이 값을 변경하지 마세요.

검토된 광고 구조는 의도적으로 보수적입니다.

- 도구 페이지에는 선택적 광고 영역을 최대 한 개만 두며, 실제 도구와 모든 보조 콘텐츠가 끝난 뒤에 표시합니다.
- 표시 결과와 조작 버튼 사이, 버튼 옆, 폼·목록·내비게이션·모달·전체화면 내부에는 광고를 넣지 않습니다.
- 홈, 개인정보 처리방침, 404 페이지에는 광고 영역이 없습니다.
- 영역에는 `Advertisements` / `광고` 라벨이 표시되며 레이아웃 이동을 줄이기 위해 넓은 화면에서 728 × 90 CSS 픽셀, 모바일에서 최대 320 × 100 CSS 픽셀을 예약합니다.
- 두 번째 광고 위치는 의도적으로 설정하지 않았습니다. 향후 페이지에 충분히 많은 고유 콘텐츠가 생기고 새 정책·UX 검토를 통과한 경우에만 다시 검토하세요.

환경 변수를 켜도 검토된 빈 연동 영역만 표시되며 광고 자체를 불러오지는 않습니다. 실제 광고 스크립트를 추가하기 전에는 Content Security Policy와 두 언어의 개인정보 처리방침을 갱신하고, 지역별로 필요한 동의 플랫폼을 선택·설정하며, 동의 선택이 저장소와 네트워크 요청을 실제로 제어하는지 검증하고, 프로덕션 도메인에서 데스크톱·모바일·다크 모드·전체화면 감사를 다시 실행해야 합니다. 빈 예약 영역을 프로덕션에서 미리 보기 위한 목적으로 광고를 켜지 마세요.

내부 이벤트 목록은 `src/lib/analytics.ts`에 정의되어 있으며 엔드포인트를 설정하지 않으면 아무것도 전송하지 않습니다.

## 브라우저 제한 사항

- 실시간 시계는 사용자의 기기 시간을 표시하며 NTP 또는 원자시계와 동기화되지 않습니다.
- 브라우저, 탭, 기기 또는 운영체제가 페이지를 중단하거나 종료하면 웹 알람과 타이머 알림 실행을 보장할 수 없습니다. 중요한 알림에는 기기의 기본 알람을 사용하세요.
- 알림 권한은 사용자가 버튼을 누른 뒤에만 요청합니다. 권한을 거부해도 페이지 내부 기능은 계속 작동합니다.
- 사용자가 페이지와 상호작용하기 전에는 브라우저 자동 재생 정책으로 소리가 차단될 수 있습니다.
- 화면 켜두기와 전체 화면 기능은 지원되지 않는 환경에서 숨겨지거나 조용히 비활성화됩니다.
- 시간대 변환기는 브라우저의 IANA 데이터로 존재하지 않는 시각을 거부하고 중복 시각에서는 오프셋 선택을 요구합니다. 공유 링크에도 선택을 보존합니다. 최신 시간대 규칙을 위해 브라우저 업데이트가 필요합니다.
- 브라우저의 사이트 데이터를 삭제하면 저장된 설정, 알람, 세계 시계 위치도 삭제됩니다.

## Living Clock — Lantern Isle

시계의 `✦ Living Clock` 버튼 또는 `/ko/clock/?view=living`으로 독창적인 Canvas 2D 등불섬을 엽니다. 기기의 현지 시각을 기준으로 하늘·해·달이 24시간을, 산책로의 60개 등불 중 켜진 개수가 분을, 60초에 한 바퀴 도는 배가 초를 표현합니다. 정각에는 잔잔한 빛의 파문이 나타납니다. 천체 위치는 실제 일출·월령 계산이 아닌 시간의 시각적 표현입니다.

선택은 브라우저에 저장됩니다. 하루 둘러보기는 현재 시간이 아님을 명시하고 20초 뒤 실시간으로 돌아옵니다. 장면은 선택 시에만 지연 로드되며 외부 에셋·라이브러리·서버 요청을 추가하지 않습니다. Canvas 해상도는 240만 픽셀 이하, 렌더링은 데스크톱 최대 30fps·작은 화면 최대 20fps로 제한합니다. 동작 줄이기 설정에서는 장식 움직임을 멈추고 초 단위로 갱신하며, 탭이나 장면이 보이지 않으면 장면 렌더링을 중단합니다.

로컬 Chromium에서 영어/한국어, 밝은/어두운 테마, 320·390px 화면, 가로 화면 및 전체 화면을 확인했습니다. 실제 모바일 기기의 발열·배터리와 Safari 호환성은 `TBD_AFTER_BENCHMARK`입니다. 시·분·초 경계와 자정 전환은 단위 테스트로 검사합니다.

## 품질 검증

Vitest는 12/24시간제와 날짜 변경, 스톱워치 일시정지·재개와 랩 통계, 타이머 종료 시각과 시간 추가, IANA 변환과 DST, 30분·45분 오프셋, 요일 반복 알람과 스누즈를 검사합니다. `astro check`는 엄격한 TypeScript와 Astro 템플릿을 검증하며, `npm run build`는 타입 검사와 프로덕션 빌드를 함께 실행합니다.

Lighthouse, LCP, INP, CLS 수치는 실제 프로덕션 주소에서 대표적인 네트워크와 기기 조건으로 측정하기 전까지 `TBD_AFTER_BENCHMARK`로 유지합니다. 측정 전 성능 점수를 주장하지 않습니다.

## Release audit (2026-09-05)

See [PRODUCT_REVIEW.md](PRODUCT_REVIEW.md) for findings, browser checks, measured limits, competitive positioning and monetization decisions. No advertising or affiliate links were activated.

Use `npm run build:release` with `PUBLIC_SITE_URL` exported in the build environment. The release gate rejects missing/placeholder/non-HTTPS origins, ads, and analytics that have not been reviewed. `npm run build` also uses https://clockgarden.com as the default canonical origin; the preview server remains local. `npm run verify:build` checks all 16 indexable pages for metadata, alternates, structured data, sitemap membership and disabled ads.

Locale paths, supported locale IDs and hreflang/sitemap generation are centralized. UI copy still contains English/Korean conditional branches: adding a third language requires replacing these branches with complete locale-keyed message dictionaries and reviewed city search aliases; changing the locale list alone is not sufficient.

Named timer presets use localStorage (up to eight), while each tab has an independent sessionStorage countdown. A browser session restore may also restore the countdown. This does not provide alerts after the page is closed. Stopwatch CSV export does not persist an active stopwatch session.

## Clock Garden production preparation

See [DEPLOYMENT.md](DEPLOYMENT.md) for the confirmed domain, release command and remaining deployment steps. No remote deployment or DNS changes have been performed.
