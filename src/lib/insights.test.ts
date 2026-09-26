import { describe, it, expect } from 'vitest';
import { articles, articleSlugs } from '../content/insights';
import { supportedLocales } from '../config';
const validTools = ['clock', 'stopwatch', 'timer', 'alarm', 'world-clock', 'time-zone-converter'];

describe('insights articles catalog', () => {
  it('defines exactly 6 article slugs', () => {
    expect(articleSlugs.length).toBe(6);
    expect(new Set(articleSlugs).size).toBe(6);
  });

  for (const locale of supportedLocales) {
    describe(`locale: ${locale}`, () => {
      it('has complete coverage for all article slugs', () => {
        const localeArticles = articles[locale];
        for (const slug of articleSlugs) {
          const article = localeArticles[slug];
          expect(article, `Missing article: ${slug} in ${locale}`).toBeDefined();
          expect(article.slug).toBe(slug);
          expect(article.title.length).toBeGreaterThan(15);
          expect(article.description.length).toBeGreaterThan(30);
          expect(article.category.length).toBeGreaterThan(3);
          expect(article.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(article.readTimeMinutes).toBeGreaterThanOrEqual(3);
          expect(article.readTimeMinutes).toBeLessThanOrEqual(15);
          expect(validTools).toContain(article.relatedTool);
          expect(article.heroLead.length).toBeGreaterThan(50);
          expect(article.sections.length).toBeGreaterThanOrEqual(4);
          for (const section of article.sections) {
            expect(section.heading.length).toBeGreaterThan(5);
            expect(section.paragraphs.length).toBeGreaterThanOrEqual(2);
          }
          expect(article.takeaways.length).toBeGreaterThanOrEqual(4);
        }
      });
    });
  }
});
