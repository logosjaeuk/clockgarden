import type { Locale } from './config';

export const copy = {
  en: {
    nav: {
      clock: 'Clock',
      stopwatch: 'Stopwatch',
      timer: 'Timer',
      alarm: 'Alarm',
      world: 'World Clock',
      converter: 'Converter',
      insights: 'Guides',
    },
    theme: 'Theme',
    language: '한국어',
    footer: 'Private by default. No account. Your settings stay in this browser.',
    privacy: 'Privacy',
    about: 'About',
    contact: 'Contact',
    terms: 'Terms',
    insights: 'Guides',
    toolsLabel: 'Time Tools',
    legalLabel: 'About & Policies',
    homeTitle: 'Current local time',
    deviceTime: 'Time from your device',
  },
  ko: {
    nav: {
      clock: '시계',
      stopwatch: '스톱워치',
      timer: '타이머',
      alarm: '알람',
      world: '세계 시계',
      converter: '시간대 변환',
      insights: '사용 안내',
    },
    theme: '테마',
    language: 'English',
    footer: '기본적으로 개인정보를 보호합니다. 계정 없이 설정은 이 브라우저에만 저장됩니다.',
    privacy: '개인정보 처리방침',
    about: '소개',
    contact: '문의',
    terms: '이용약관',
    insights: '사용 안내',
    toolsLabel: '시간 도구',
    legalLabel: '정보 및 정책',
    homeTitle: '현재 현지 시간',
    deviceTime: '기기의 시간을 표시합니다',
  },
} as const;

export function pathFor(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? normalized : `/${locale}${normalized}`;
}
