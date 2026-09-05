import { describe, it, expect } from 'vitest';
import { englishMatrix } from './word-matrix';
describe('English letter matrix', () => {
  it('reads every hour/minute in order without sharing hour and minute letters', () => {
    for (let h = 0; h < 24; h++)
      for (let m = 0; m < 60; m++) {
        const result = englishMatrix(h, m);
        expect(result.letters).toHaveLength(18 * 16);
        expect(result.letters.every((c) => /^[A-Z]$/.test(c))).toBe(true);
        const lit = new Set(result.active);
        expect(result.letters.filter((_, i) => lit.has(i)).join('')).toBe(
          result.phrase.replaceAll(' ', ''),
        );
      }
  });
  it('handles midnight, single minutes, teens and compound minutes', () => {
    expect(englishMatrix(0, 0).phrase).toBe('IT IS TWELVE OCLOCK');
    expect(englishMatrix(13, 1).phrase).toBe('IT IS ONE OH ONE');
    expect(englishMatrix(23, 17).phrase).toBe('IT IS ELEVEN SEVENTEEN');
    expect(englishMatrix(12, 59).phrase).toBe('IT IS TWELVE FIFTY NINE');
  });
});
