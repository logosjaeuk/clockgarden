# Insights Knowledge Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish an authoritative, bilingual "Time & Focus Insights" knowledge hub (6 long-form articles, index pages, dynamic article viewer, Schema.org Article JSON-LD) to permanently surpass Google AdSense E-E-A-T criteria and achieve 90%+ approval rate.

**Architecture:** Pure Astro static generation with zero runtime JS overhead. Articles are strongly typed in `src/content/insights.ts` ensuring 100% bilingual parity (`en` and `ko`) and compile-time verification. Dynamic SSG routes (`/insights/[slug]/` and `/ko/insights/[slug]/`) render semantic HTML with Article JSON-LD schemas and related tool cross-links.

**Tech Stack:** Astro 5, TypeScript 5.9, Vanilla CSS (matching Clock Garden dark/light design system), Schema.org Article structured data.

## Global Constraints

- **Bilingual Parity:** Every article, category, eyebrow, summary, and callout must exist with equal depth in English (`en`) and Korean (`ko`).
- **Zero Third-Party Trackers:** No analytics or external tracking scripts added.
- **Pure Static Rendering:** Pre-rendered at build time with `trailingSlash: 'always'`.
- **E-E-A-T Authenticity:** Real scientific/engineering citations (chronobiology, W3C standards, IETF RFCs, neuroscience) with zero generic AI filler.
- **Verification Integrity:** All routes verified in `scripts/verify-build.mjs` and `npm run build:release`.

---

## Task Decomposition

### Task 1: Data Model & Article Catalog Specification
**Files:**
- Create: `src/content/insights.ts`
- Create: `src/lib/insights.test.ts`

**Interfaces:**
- Define `ArticleCopy`: `slug`, `title`, `description`, `category`, `publishedDate`, `readTimeMinutes`, `relatedTool: ToolKey`, `sections: { heading: string; paragraphs: string[]; callout?: string }[]`, `takeaways: string[]`.
- Export `articles: Record<Locale, Record<string, ArticleCopy>>` containing all 6 bilingual articles.
- Add test assertions for unique slugs, valid dates, non-empty sections, and full EN/KO parity.

### Task 2: Hub Index Pages (`/insights/` & `/ko/insights/`)
**Files:**
- Create: `src/pages/insights/index.astro`
- Create: `src/pages/ko/insights/index.astro`
- Modify: `src/styles/global.css` (add `.insights-grid`, `.insight-card`, `.insight-badge`, `.insight-meta`)

**Interfaces:**
- Render searchable/filterable grid of articles grouped by category.
- Feature card for the signature article (*Behind Living Clock: Crafting Digital Zen*).
- Complete SEO meta tags and alternate hreflang tags.

### Task 3: Dynamic Article Viewer Template (`/insights/[slug]/`)
**Files:**
- Create: `src/pages/insights/[slug].astro`
- Create: `src/pages/ko/insights/[slug].astro`
- Modify: `src/styles/global.css` (add `.article-layout`, `.article-prose`, `.article-callout`, `.article-tool-cta`, `.article-takeaways`)

**Interfaces:**
- `getStaticPaths` returning all 6 article slugs per locale.
- Schema.org `Article` / `TechArticle` JSON-LD in `<slot name="head" />`.
- Breadcrumb navigation: Home > Insights > [Article Title].
- End-of-article interactive CTA linking to the corresponding Clock Garden tool.

### Task 4: Global Navigation, Footer, and Sitemap Integration
**Files:**
- Modify: `src/i18n.ts` (add `insights` to nav labels and footer copy)
- Modify: `src/layouts/BaseLayout.astro` (add Insights link to header `<nav>` and footer)
- Modify: `src/pages/sitemap.xml.ts` (include `/insights/` and all 6 article paths for both locales)

### Task 5: Release Verification & Build Assertions
**Files:**
- Modify: `scripts/verify-build.mjs` (expand routes from 22 to 36 pages, assert Article JSON-LD on all 12 article pages)
- Run `npm test`, `npm run typecheck`, `npm run build:release`.
