import type { Locale } from './config';

export const copy = {
  en: {
    nav: {
      magazine: 'Magazine',
      about: 'About',
      contact: 'Contact',
    },
    theme: 'Theme',
    language: '한국어',
    footer: 'Clock Garden is an authoritative digital journal dedicated to horology, chronometry, and the science of time measurement.',
    privacy: 'Privacy Policy',
    about: 'About & Editorial',
    contact: 'Contact',
    terms: 'Terms of Service',
    editorialPolicy: 'Editorial Policy & Fact-Checking',
    legalLabel: 'Editorial & Legal',
    categoriesLabel: 'Subject Areas',
    homeTitle: 'Clock Garden — Horology Journal & Chronometry Lab',
  },
  ko: {
    nav: {
      magazine: '시계학 매거진',
      about: '연구진 소개',
      contact: '문의 및 제보',
    },
    theme: '테마',
    language: 'English',
    footer: '클락가든은 시계학(Horology), 정밀 계측 공학, 그리고 시간의 역사를 심층 탐구하는 전문 독립 학술 저널입니다.',
    privacy: '개인정보 처리방침',
    about: '연구진 소개',
    contact: '문의 및 제보',
    terms: '이용약관',
    editorialPolicy: '편집 및 팩트체크 원칙',
    legalLabel: '저널 정책 및 고지',
    categoriesLabel: '주제별 카테고리',
    homeTitle: '클락가든 — 시계학 저널 & 정밀 시간 계측 연구소',
  },
};

export function pathFor(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') {
    return normalized;
  }
  return `/ko${normalized === '/' ? '/' : normalized}`;
}
