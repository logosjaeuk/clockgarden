import { describe, it, expect } from 'vitest';
import { resolveZone } from './cities';
import { supportedTimeZones } from './timezone';
import { validateTimerSession, validatePresets } from './timer-session';

describe('return-visit data', () => {
  it('finds English/Korean city names and rejects ambiguous abbreviations', () => {
    const zones = supportedTimeZones();
    expect(resolveZone('서울', zones)).toBe('Asia/Seoul');
    expect(resolveZone('New York', zones)).toBe('America/New_York');
    expect(resolveZone('London', zones)).toBe('Europe/London');
    expect(resolveZone('CST', zones)).toBeNull();
    expect(resolveZone('garbage', zones)).toBeNull();
  });
  it('restores finite countdown deadlines and rejects corrupted storage', () => {
    const session = {
      initialMs: 300000,
      state: { remainingMs: 200000, targetAt: 1700000000000 },
      repeat: false,
    };
    expect(validateTimerSession(session)).toEqual(session);
    expect(validateTimerSession({ ...session, state: { remainingMs: -1 } })).toBeNull();
    expect(validateTimerSession({ ...session, initialMs: Infinity })).toBeNull();
    expect(validateTimerSession(null)).toBeNull();
    expect(validatePresets([{ label: 'Tea', milliseconds: 180000 }])).toHaveLength(1);
    expect(validatePresets([{ label: 'Tea', milliseconds: -1 }])).toBeNull();
  });

  it('contains consistent E-E-A-T navigation and footer labels in en and ko', async () => {
    const { copy } = await import('../i18n');
    for (const lang of ['en', 'ko'] as const) {
      expect(copy[lang].about).toBeDefined();
      expect(copy[lang].contact).toBeDefined();
      expect(copy[lang].terms).toBeDefined();
      expect(copy[lang].privacy).toBeDefined();
    }
  });

  it('provides substantive FAQs for timer and stopwatch in en and ko', async () => {
    const { toolPages } = await import('../content/toolPages');
    for (const lang of ['en', 'ko'] as const) {
      expect(toolPages[lang].timer.faqs.length).toBeGreaterThanOrEqual(4);
      expect(toolPages[lang].stopwatch.faqs.length).toBeGreaterThanOrEqual(4);
      for (const faq of toolPages[lang].timer.faqs) {
        expect(faq.question.length).toBeGreaterThan(10);
        expect(faq.answer.length).toBeGreaterThan(30);
      }
      for (const faq of toolPages[lang].stopwatch.faqs) {
        expect(faq.question.length).toBeGreaterThan(10);
        expect(faq.answer.length).toBeGreaterThan(30);
      }
    }
  });
});
