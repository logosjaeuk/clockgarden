# Design Specification: Clock Garden AdSense Compliance & Anti-Slop Transformation

- **Date**: 2026-09-26
- **Status**: Approved
- **Target Site**: Clock Garden (`https://clockgarden.com`)

## 1. Problem Statement & Root Cause Analysis

Clock Garden was disapproved by Google AdSense under the classification of **"가치없는 콘텐츠" (Low-value content / Thin content)**.

### Root Causes Identified
1. **Extreme Thin Content (Low Text-to-Code Ratio)**:
   - Tool pages contained an interactive canvas/JS widget accompanied by merely 2 short generic paragraphs (~50-100 words).
   - Automated quality evaluators classify this as an empty utility wrapper / placeholder page built solely to harvest ad impressions.
2. **Missing E-E-A-T & Trust Foundation Pages**:
   - No **About** page: Operator identity, development philosophy, and artistic/technical provenance were absent.
   - No **Contact / Support** page: No feedback mechanism, error reporting channel, or customer support touchpoint (`contact@clockgarden.com`).
   - No **Terms of Service**: Missing terms clarifying browser sleep limitations, local storage, and utility usage disclaimers.
3. **Policy Contradiction in Privacy Policy**:
   - `privacy.astro` claimed the site loads no advertising scripts, yet `BaseLayout.astro` embeds the Google AdSense client loader (`ca-pub-9708700594020227`). This is a direct policy violation under Google AdSense publisher transparency policies.
4. **Perception of "AI Slop" / Generic Template**:
   - Boilerplate tool descriptions lacked genuine real-world advice, human workflows, keyboard shortcut reference tables, and actionable utility.
   - Clock Garden's greatest original asset—the bespoke, handcrafted **Living Clock** (Blender 3D scenes, procedural canvas art, day-night astronomical cycles)—was obscured and barely described in 1 sentence.

---

## 2. Architectural Design & Solutions

### A. Information Architecture & Navigation

#### New Pages (Bilingual: `en` and `ko`)
1. `/about/` & `/ko/about/`:
   - Detailed backstory of Clock Garden (indie development, privacy-first, zero-tracking, offline capabilities).
   - Handcrafted art & engineering spotlight: How the Living Clock scenes (The Lantern Island, Moonlit Conservatory, Quiet Study, Rainlight) are created using Blender and procedural shaders.
   - Technical transparency: Precision timing mechanisms (`performance.now()`, drift compensation, IANA timezone database).
2. `/contact/` & `/ko/contact/`:
   - Official contact email: `contact@clockgarden.com`.
   - Response time expectations (1-2 business days).
   - Guidelines for bug reports (browser version, OS, reproduction steps) and timezone/DST anomaly reports.
3. `/terms/` & `/ko/terms/`:
   - Acceptable use and local client-side execution.
   - Technical limitations of browser environments (device sleep, background tab throttling, OS battery saver restrictions) and recommendation to use native OS alarms for mission-critical wakeups.
   - Limitation of liability and intellectual property rights for original art assets.
4. `/privacy/` & `/ko/privacy/` (Comprehensive Update):
   - Clear disclosure of third-party advertising partners (Google AdSense) and cookie/local storage usage.
   - Explicit instructions on how users can opt out of personalized advertising via Google Ads Settings.
   - Local storage audit (storing theme, alarm presets, saved world clock cities).

#### Navigation & Footer Structure
- **Header**: Clean, accessible navigation across tools with responsive styling and language switcher.
- **Footer**:
  - Organized into distinct columns:
    - **Tools**: Clock, Stopwatch, Timer, Alarm, World Clock, Time Zone Converter.
    - **About & Legal**: About Us, Contact & Support, Terms of Service, Privacy Policy.
    - **Philosophy Statement**: Clear summary of privacy-first, client-side computing.

---

### B. Deep Editorial Transformation per Tool (Anti-Slop Content Engine)

Each tool page (`/clock/`, `/stopwatch/`, `/timer/`, `/alarm/`, `/world-clock/`, `/time-zone-converter/`) will be enhanced in `src/content/toolPages.ts` and `GenericToolPage.astro` to feature:

1. **Interactive Tool Component**: Kept instantly usable above the fold.
2. **Quick Controls & Keyboard Shortcuts**:
   - Structured table/pills for keyboard navigation (e.g. Space to Start/Pause, L for Lap, R for Reset, F for Fullscreen).
3. **Comprehensive Practical Guide & Workflows (1,000+ words of depth per tool)**:
   - **Timer**: Deep dive into the Pomodoro Technique (25/5 rhythm, cognitive benefits), 2-Minute Rule for procrastination, precision brewing recipes (coffee/tea).
   - **Stopwatch**: HIIT & Tabata interval tracking, athletic split pacing, how to export and interpret lap times via CSV.
   - **Clock**: Synchronizing device time against atomic clocks, fullscreen ambient clock for desk setups, Living Clock visual meditation.
   - **Alarm**: Sleep hygiene, 90-minute REM sleep cycle alignment, circadian rhythm synchronization, setting multi-stage morning routines.
   - **World Clock**: Remote distributed team collaboration guide, overlapping business hours matrix, IANA standards vs fixed offset pitfalls.
   - **Time Zone Converter**: Demystifying Daylight Saving Time (DST) spring-forward gaps and fall-back duplicates, scheduling global webinars without date errors.
4. **Engineering Insights & Technical Accuracy**:
   - In-depth explanation of browser animation frame throttling (`requestAnimationFrame`), Web Workers, monotonic clock time vs system wall clock changes.
5. **Interactive & Rich FAQ Section with Schema.org `FAQPage`**:
   - 4-5 high-value questions and answers per tool.
   - Structured JSON-LD injected into page head for enhanced Google search snippets and automated quality validation.

---

### C. SEO, Structured Data, and Verification Automation

1. **Schema.org Structured Data**:
   - `WebApplication` schema on all tool pages.
   - `FAQPage` schema on all tool pages with all Q&A pairs.
   - `Organization` and `WebSite` schema on Home, About, and Contact pages.
2. **Sitemap & Robots**:
   - Update `src/pages/sitemap.xml.ts` to automatically index `/about/`, `/contact/`, `/terms/`, and `/privacy/` across all supported locales (`en`, `ko`).
3. **Automated Verification Pipeline**:
   - Update `scripts/verify-build.mjs` to validate all 20 HTML routes (8 English + 8 Korean + 404 + home):
     - Single `<h1>` tag per page.
     - Unique `<title>` with "Clock Garden".
     - Valid canonical and hreflang links (`en`, `ko`, `x-default`).
     - Proper presence in `sitemap.xml`.
     - Valid JSON-LD schemas (`WebApplication`, `FAQPage`, etc.).
     - Correct AdSense script tag in `<head>`.
     - 0 build errors in Astro and 0 TypeScript errors.

---

## 3. Verification Plan

1. **Unit & Integration Tests**:
   - `npm test`: Verify existing 32 unit tests pass without regressions.
2. **Type Checking & Linting**:
   - `npm run typecheck`: Ensure 0 Astro/TS diagnostics.
   - `npm run lint`: Prettier check and Astro check.
3. **Static Build & Release Verification**:
   - `npm run build`: Verify all pages compile statically into `dist/`.
   - `npm run verify:build`: Comprehensive assertions on all generated HTML files.
4. **Browser & Mobile Usability Verification**:
   - Run dev preview server and inspect pages in desktop and mobile viewports (320px, 375px, 768px, 1280px).
   - Ensure clean typography, responsive tables, accessible contrast, and zero layout overflow.
