# Clock Garden AdSense Compliance & Anti-Slop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overcome Google AdSense "가치없는 콘텐츠" (Low-value content) rejection and eliminate any perception of "AI slop" by creating essential E-E-A-T trust pages (About, Contact, Terms, compliant Privacy), transforming all 6 tool pages into deep, authoritative, practical guides with FAQPage structured data, highlighting handcrafted Living Clock art, and automating build verification.

**Architecture:** Astro static site with localized routing (`en` and `ko`), centralized content dictionary in `src/content/toolPages.ts`, reusable `GenericToolPage.astro` with Schema.org `WebApplication` and `FAQPage` microdata, organized multi-column footer navigation in `BaseLayout.astro`, and automated build assertions in `scripts/verify-build.mjs`.

**Tech Stack:** Astro 5 / TypeScript, Vitest, Vanilla CSS, Schema.org JSON-LD, Node.js scripts.

## Global Constraints
- Pure static HTML generation (zero runtime server, zero analytics trackers, zero external fonts/frameworks).
- All tools must execute 100% client-side with zero data transmission to any backend.
- Full bilingual parity (`en` and `ko`) for every page, title, meta description, and FAQ.
- No disruptions to existing tests or ongoing Living Clock scene additions (`snowbound`).
- Google AdSense script loader (`client=ca-pub-9708700594020227`) must remain in `<head>` and be accurately disclosed in Privacy Policy.

---

### Task 1: Essential E-E-A-T Pages (About, Contact, Terms) & Privacy Update

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/ko/about.astro`
- Create: `src/pages/contact.astro`
- Create: `src/pages/ko/contact.astro`
- Create: `src/pages/terms.astro`
- Create: `src/pages/ko/terms.astro`
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/ko/privacy.astro`
- Modify: `src/i18n.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `src/lib/product.test.ts`

- [ ] **Step 1: Update i18n dictionary and product test**
  Add navigation and footer keys for `about`, `contact`, `terms`, `privacy`, and brand philosophy description.
  Add tests in `src/lib/product.test.ts` checking that `copy.en` and `copy.ko` have matching keys for all new pages.

- [ ] **Step 2: Run test to verify failure**
  Run: `npm test`
  Expected: FAIL (missing keys in copy or test failure).

- [ ] **Step 3: Implement i18n keys and update BaseLayout.astro**
  Update `src/i18n.ts` with labels and updated footer copy.
  Update `src/layouts/BaseLayout.astro` footer to display structured link columns (Tools, Service Information, Philosophy).

- [ ] **Step 4: Create About, Contact, Terms, and update Privacy pages**
  Create `src/pages/about.astro` and `src/pages/ko/about.astro` detailing:
  - The Clock Garden mission: privacy-first, zero-tracking, client-side execution.
  - The Living Clock origin: bespoke 3D Blender models, procedural canvas art, day-night lighting.
  - Engineering architecture: `performance.now()`, IANA database, drift-free execution.
  Create `src/pages/contact.astro` and `src/pages/ko/contact.astro`:
  - Official contact email: `contact@clockgarden.com`.
  - Guidelines for bug reports, timezone anomaly reports, and feature feedback.
  Create `src/pages/terms.astro` and `src/pages/ko/terms.astro`:
  - Permitted use, browser battery saver and sleep mode disclaimers.
  Update `src/pages/privacy.astro` and `src/pages/ko/privacy.astro`:
  - Disclose Google AdSense third-party advertising cookies and personalization settings.
  - Detail local storage and session storage data boundaries.

- [ ] **Step 5: Run tests and verify**
  Run: `npm test` and `npm run typecheck`
  Expected: PASS

- [ ] **Step 6: Commit Task 1**
  ```bash
  git add src/i18n.ts src/layouts/BaseLayout.astro src/pages/about.astro src/pages/ko/about.astro src/pages/contact.astro src/pages/ko/contact.astro src/pages/terms.astro src/pages/ko/terms.astro src/pages/privacy.astro src/pages/ko/privacy.astro src/lib/product.test.ts
  git commit -m "feat: add About, Contact, Terms pages and update Privacy policy for AdSense compliance"
  ```

---

### Task 2: Deep Practical Guides & FAQ for Timer & Stopwatch

**Files:**
- Modify: `src/content/toolPages.ts`
- Modify: `src/components/GenericToolPage.astro`
- Modify: `src/styles/global.css`
- Test: `src/lib/product.test.ts`

- [ ] **Step 1: Write tests for ToolPage FAQ and Guide structure**
  In `src/lib/product.test.ts`, assert that `toolPages[locale][tool]` includes `faqs` (array of `{ question, answer }`) and rich sections with minimum substantive content lengths.

- [ ] **Step 2: Update GenericToolPage.astro to render rich guides & Schema.org FAQPage**
  Add JSON-LD for `FAQPage` alongside `WebApplication`.
  Render keyboard shortcut badges and styled FAQ accordions/cards.

- [ ] **Step 3: Enrich Timer and Stopwatch copy in `src/content/toolPages.ts`**
  - **Timer**:
    - Practical Guide: Pomodoro Technique (25m focus / 5m recharge), 2-minute productivity rule, coffee & tea brewing times, study sprints.
    - Engineering notes: Browser background tab throttling, session preservation.
    - 4-5 high-value FAQs in EN & KO.
  - **Stopwatch**:
    - Practical Guide: HIIT / Tabata workout intervals, athletic lap splitting & pace analysis, CSV export workflow.
    - Engineering notes: Drift-free monotonic `performance.now()` clock.
    - 4-5 high-value FAQs in EN & KO.

- [ ] **Step 4: Run tests and typecheck**
  Run: `npm test` and `npm run typecheck`
  Expected: PASS

- [ ] **Step 5: Commit Task 2**
  ```bash
  git add src/content/toolPages.ts src/components/GenericToolPage.astro src/styles/global.css src/lib/product.test.ts
  git commit -m "feat: expand Timer and Stopwatch with practical guides, shortcuts, and FAQPage schema"
  ```

---

### Task 3: Deep Practical Guides & FAQ for Clock & Alarm

**Files:**
- Modify: `src/content/toolPages.ts`
- Test: `src/lib/product.test.ts`

- [ ] **Step 1: Enrich Clock and Alarm copy in `src/content/toolPages.ts`**
  - **Clock**:
    - Practical Guide: 12/24-hour modes, seconds & milliseconds synchronization, fullscreen ambient desk clock, Living Clock meditative artwork.
    - Engineering notes: Local device hardware clock vs NTP atomic servers, screen wake lock API.
    - 4-5 high-value FAQs in EN & KO.
  - **Alarm**:
    - Practical Guide: Circadian rhythms and 90-minute REM sleep cycles, morning routines, hydration & medication routine alarms.
    - Engineering notes: Critical browser sleep limitations, why native phone alarms are recommended for life-critical wakeups.
    - 4-5 high-value FAQs in EN & KO.

- [ ] **Step 2: Run tests and typecheck**
  Run: `npm test` and `npm run typecheck`
  Expected: PASS

- [ ] **Step 3: Commit Task 3**
  ```bash
  git add src/content/toolPages.ts src/lib/product.test.ts
  git commit -m "feat: expand Clock and Alarm with sleep science, desk setups, and FAQPage schema"
  ```

---

### Task 4: Deep Practical Guides & FAQ for World Clock & Time Zone Converter

**Files:**
- Modify: `src/content/toolPages.ts`
- Test: `src/lib/product.test.ts`

- [ ] **Step 1: Enrich World Clock and Time Zone Converter copy in `src/content/toolPages.ts`**
  - **World Clock**:
    - Practical Guide: Remote distributed team collaboration, overlapping business hour matrix (e.g. Seoul - London - New York), reference city ordering.
    - Engineering notes: IANA timezone database vs manual offsets, UTC/GMT differences.
    - 4-5 high-value FAQs in EN & KO.
  - **Time Zone Converter**:
    - Practical Guide: Daylight Saving Time (DST) complexities (Spring Forward 23h days, Fall Back 25h days), scheduling international webinars without timezone mistakes.
    - Engineering notes: Disambiguation of repeated/skipped local times, shareable permalinks.
    - 4-5 high-value FAQs in EN & KO.

- [ ] **Step 2: Run tests and typecheck**
  Run: `npm test` and `npm run typecheck`
  Expected: PASS

- [ ] **Step 3: Commit Task 4**
  ```bash
  git add src/content/toolPages.ts src/lib/product.test.ts
  git commit -m "feat: expand World Clock and Time Zone Converter with global team guides and FAQPage schema"
  ```

---

### Task 5: Sitemap, Structured Data & Living Clock Showcase on Home

**Files:**
- Modify: `src/pages/sitemap.xml.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ko/index.astro`
- Modify: `src/styles/global.css`
- Test: `src/lib/product.test.ts`

- [ ] **Step 1: Update sitemap.xml.ts**
  Ensure all newly added routes (`/about/`, `/contact/`, `/terms/`, `/privacy/`) are indexed across both `en` and `ko`.

- [ ] **Step 2: Enhance Home page (`index.astro` & `ko/index.astro`)**
  Highlight the Living Clock prominently, introduce Clock Garden's indie craftsmanship, and provide clear discovery pathways to the newly enriched guides and tools.

- [ ] **Step 3: Run tests and typecheck**
  Run: `npm test` and `npm run typecheck`
  Expected: PASS

- [ ] **Step 4: Commit Task 5**
  ```bash
  git add src/pages/sitemap.xml.ts src/pages/index.astro src/pages/ko/index.astro src/styles/global.css src/lib/product.test.ts
  git commit -m "feat: showcase Living Clock craft on home page and index all pages in sitemap"
  ```

---

### Task 6: Release Verification & Build Compliance

**Files:**
- Modify: `scripts/verify-build.mjs`

- [ ] **Step 1: Update verify-build.mjs**
  Expand checked routes to include `['', ...tools, 'privacy', 'about', 'contact', 'terms']`.
  Verify unique titles, single `<h1>`, canonical URLs, alternate hreflang, AdSense `<head>` loader, and JSON-LD structured data (`WebApplication`, `FAQPage`).

- [ ] **Step 2: Execute full build and verification pipeline**
  Run: `npm run build`
  Run: `npm run verify:build`
  Expected: PASS (All 20 HTML routes verified with 0 errors).

- [ ] **Step 3: Commit Task 6**
  ```bash
  git add scripts/verify-build.mjs
  git commit -m "test: update release build verification to validate all E-E-A-T and tool routes"
  ```
