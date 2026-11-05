import type { Locale } from './config';

export const copy = {
  en: {
    nav: {
      magazine: 'Magazine',
      clock: 'Clock',
      stopwatch: 'Stopwatch',
      timer: 'Timer',
      alarm: 'Alarm',
      world: 'World Clock',
      converter: 'Converter',
      serverTime: 'Ticket time',
      insights: 'Articles',
      about: 'About',
      contact: 'Contact',
    },
    theme: 'Theme',
    language: '한국어',
    footer: 'Clock Garden is an authoritative digital journal and precision time utility dedicated to horology, chronometry, and the science of time measurement.',
    privacy: 'Privacy Policy',
    about: 'About & Editorial',
    contact: 'Contact',
    terms: 'Terms of Service',
    editorialPolicy: 'Editorial Policy & Fact-Checking',
    insights: 'Horology Journal',
    toolsLabel: 'Precision Time Instruments',
    legalLabel: 'Editorial & Standards',
    categoriesLabel: 'Subject Areas',
    homeTitle: 'Clock Garden — Horology Journal & Precision Time',
    deviceTime: 'Time from your device',
  },
  ko: {
    nav: {
      magazine: '시계학 매거진',
      clock: '시계',
      stopwatch: '스톱워치',
      timer: '타이머',
      alarm: '알람',
      world: '세계 시계',
      converter: '시간대 변환',
      serverTime: '티켓팅 시계',
      insights: '아티클',
      about: '소개',
      contact: '문의',
    },
    theme: '테마',
    language: 'English',
    footer: '클락가든은 시계학(Horology), 정밀 계측 공학, 그리고 시간의 역사를 심층 탐구하는 전문 디지털 저널이자 웹 브라우저 기반의 정밀 시간 계측 플랫폼입니다.',
    privacy: '개인정보 처리방침',
    about: '연구진 소개',
    contact: '문의 및 제보',
    terms: '이용약관',
    editorialPolicy: '편집 및 팩트체크 원칙',
    insights: '시계학 저널',
    toolsLabel: '정밀 시간 계측 도구',
    legalLabel: '저널 소개 및 정책',
    categoriesLabel: '주제별 카테고리',
    homeTitle: '클락가든 — 시계학 저널 & 정밀 시간 계측 연구소',
    deviceTime: '기기의 시간을 표시합니다',
  },
} as const;

export function pathFor(locale: Locale, path: string): string {
  const clean = path.replace(/^\/(?:en|ko)(?=\/|$)/, '') || '/';
  if (locale === 'en') return clean;
  return clean === '/' ? '/ko/' : `/ko${clean}`;
}
