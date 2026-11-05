import type { Locale } from './config';

export const copy = {
  en: {
    nav: {
      magazine: 'Guides',
      about: 'About',
      contact: 'Contact',
    },
    theme: 'Theme',
    language: '한국어',
    footer: 'Clock Garden is a digital productivity lab providing actionable guides on spreadsheets, Notion, templates, and smart workplace workflows.',
    privacy: 'Privacy Policy',
    about: 'About & Editorial',
    contact: 'Contact',
    terms: 'Terms of Service',
    editorialPolicy: 'Editorial Policy & Standards',
    legalLabel: 'Editorial & Legal',
    categoriesLabel: 'Core Topics',
    homeTitle: 'Clock Garden — Smart Work & Productivity Field Guide',
  },
  ko: {
    nav: {
      magazine: '실무 가이드',
      about: '소개 & 연구팀',
      contact: '문의 및 피드백',
    },
    theme: '테마',
    language: 'English',
    footer: '클락가든(Clock Garden)은 직장인과 프리랜서의 시간을 절약해주는 스마트 워크, 스프레드시트, 노션, 실무 서식 및 업무 자동화 가이드를 제공하는 디지털 생산성 저널입니다.',
    privacy: '개인정보 처리방침',
    about: '소개 & 연구팀',
    contact: '문의 및 피드백',
    terms: '이용약관',
    editorialPolicy: '편집 및 콘텐츠 품질 기준',
    legalLabel: '저널 정책 및 고지',
    categoriesLabel: '실무 핵심 카테고리',
    homeTitle: '클락가든 — 스마트 워크 & 실무 도구 가이드',
  },
};

export function pathFor(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') {
    return normalized;
  }
  return `/ko${normalized === '/' ? '/' : normalized}`;
}
