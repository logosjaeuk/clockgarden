import type { Locale } from '../config';

export type ToolKey =
  'clock' | 'stopwatch' | 'timer' | 'alarm' | 'world-clock' | 'time-zone-converter';
export interface ToolPageCopy {
  title: string;
  meta: string;
  eyebrow: string;
  heading: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
}

export const toolPages: Record<Locale, Record<ToolKey, ToolPageCopy>> = {
  en: {
    clock: {
      title: 'Clock with Seconds – Current Local Time',
      meta: 'See your current device time with seconds, optional milliseconds, 12/24-hour mode, analog view, fullscreen, and wake lock.',
      eyebrow: 'Live device clock',
      heading: 'Clock with seconds',
      intro:
        'Read your device time at a glance, or enter Living Clock: a little island where the sky follows the hour, lanterns count the minutes, and a ferry traces the seconds.',
      sections: [
        {
          heading: 'About this clock',
          body: 'The display is calculated from your device clock on every update, so a delayed browser frame does not make it drift. It follows your device settings; if that clock is wrong, this display is too.',
        },
        {
          heading: 'Display options',
          body: 'Turn seconds or milliseconds on, switch between 12- and 24-hour time, show an analog face, or enter fullscreen. Wake lock is offered only where the browser supports it and only after you enable it.',
        },
      ],
    },
    stopwatch: {
      title: 'Online Stopwatch with Laps',
      meta: 'Run a precise online stopwatch with pause, resume, laps, split totals, best, slowest and average lap statistics.',
      eyebrow: 'For practice, workouts and split times',
      heading: 'Online stopwatch',
      intro:
        'Measure elapsed time with millisecond display, lap splits, useful statistics, and keyboard shortcuts.',
      sections: [
        {
          heading: 'Reliable elapsed time',
          body: 'Record a lap at the end of each exercise or practice run. Each row shows the lap duration and total elapsed time; best, slowest and average help compare attempts. Download your laps as CSV before refreshing or leaving. Device sleep may pause measurement in some browsers.',
        },
        {
          heading: 'Keyboard controls',
          body: 'Press Space to start or pause, L to record a lap, and R to reset while paused. Reset is intentionally unavailable while the stopwatch is running.',
        },
      ],
    },
    timer: {
      title: 'Online Timer and Countdown',
      meta: 'Set a countdown timer with presets, pause, resume, add time, repeat, sound, notifications and fullscreen mode.',
      eyebrow: 'Your next focus session',
      heading: 'Online timer',
      intro:
        'Start with a preset or your own duration. Save your everyday timers, keep the countdown through a refresh, and see the remaining time in the browser tab.',
      sections: [
        {
          heading: 'Save a timer you use every day',
          body: 'Set 3 minutes for tea, 25 for focused work, or your own duration. Open My timers to give it a name and save it. Choose it on your next visit, or copy its link to bookmark the same duration. A running countdown is restored after refreshing this tab.',
        },
        {
          heading: 'Notifications and sound',
          body: 'Permission is requested only when you choose to enable notifications. Sound may be limited by browser autoplay rules, and a closed or suspended page cannot guarantee delivery.',
        },
      ],
    },
    alarm: {
      title: 'Online Alarm Clock with Multiple Alarms',
      meta: 'Create multiple browser alarms with labels, weekday repeats, sounds, snooze, local persistence and optional notifications.',
      eyebrow: 'Locally saved alarms',
      heading: 'Online alarm clock',
      intro:
        'Create multiple labeled alarms, choose repeat days and sounds, and keep them saved in this browser.',
      sections: [
        {
          heading: 'Important browser limitation',
          body: 'A normal web page cannot guarantee an alarm after the browser, tab, device, or operating system suspends or closes it. Keep this page active for the most reliable result; use your device alarm for critical reminders.',
        },
        {
          heading: 'Private local storage',
          body: 'Alarm settings are stored locally in this browser. There is no account or server database, so alarms do not sync between devices.',
        },
      ],
    },
    'world-clock': {
      title: 'World Clock – Current Time Around the World',
      meta: 'Search and save world time zones, compare current local times, UTC offsets and day differences, and reorder locations.',
      eyebrow: 'Live global comparison',
      heading: 'World clock',
      intro:
        'Add and compare time zones with live local times, UTC offsets, and clear previous- or next-day labels.',
      sections: [
        {
          heading: 'Standards-based time zones',
          body: 'World times use the browser’s Intl implementation and IANA time zone identifiers. Daylight-saving rules and historical offset changes are not manually hardcoded.',
        },
        {
          heading: 'Your locations',
          body: 'Add the cities where your colleagues, friends or family live. Search by a city such as Seoul, New York or London, or choose an IANA zone from the list. Move your home city to the top: day differences use it as the reference. Your list is ready when you return.',
        },
      ],
    },
    'time-zone-converter': {
      title: 'Time Zone Converter and Time Difference Tool',
      meta: 'Convert a date and time between multiple IANA time zones with DST-aware offsets and next-day or previous-day indicators.',
      eyebrow: 'DST-aware conversion',
      heading: 'Time zone converter',
      intro:
        'Convert one local date and time into multiple destinations, including UTC offsets and date changes.',
      sections: [
        {
          heading: 'Daylight-saving time',
          body: 'Conversion uses IANA time zones through browser standards instead of fixed offsets, so seasonal daylight-saving changes are reflected by the platform data.',
        },
        {
          heading: 'Ambiguous local times',
          body: 'In New York, 02:30 on March 8, 2026 does not exist; 01:30 on November 1 occurs twice. This converter rejects missing times and asks you to choose an offset for repeated times. Copy result link preserves the date, destinations and selected occurrence for everyone opening it.',
        },
      ],
    },
  },
  ko: {
    clock: {
      title: '초 단위 현재 시간 시계',
      meta: '현재 기기 시간을 초와 선택적 밀리초, 12/24시간제, 아날로그 보기, 전체 화면으로 확인하세요.',
      eyebrow: '실시간 기기 시계',
      heading: '초 단위 시계',
      intro:
        '기기 시간을 숫자로 확인하거나 Living Clock의 등불섬으로 들어가세요. 하늘은 시를, 등불은 분을, 항구를 도는 배는 초를 보여 줍니다.',
      sections: [
        {
          heading: '이 시계의 기준',
          body: '매 화면 갱신마다 기기 시계에서 시간을 계산하므로 브라우저 렌더링이 지연되어도 누적 오차가 생기지 않습니다. 기기 시간이 틀리면 이 시계도 틀립니다. 표준시 서버와 동기화하는 기능은 없습니다.',
        },
        {
          heading: '표시 옵션',
          body: '초와 밀리초, 12/24시간제, 아날로그 보기, 전체 화면을 선택할 수 있습니다. 화면 켜두기는 지원되는 브라우저에서 사용자가 직접 켠 경우에만 동작합니다.',
        },
      ],
    },
    stopwatch: {
      title: '랩 기록 온라인 스톱워치',
      meta: '일시정지, 계속, 랩, 누적 기록, 최고·최저·평균 랩 통계를 지원하는 정밀 스톱워치입니다.',
      eyebrow: '운동과 연습, 구간 기록',
      heading: '온라인 스톱워치',
      intro: '밀리초 표시와 랩 기록, 통계, 키보드 단축키로 경과 시간을 측정합니다.',
      sections: [
        {
          heading: '신뢰할 수 있는 경과 시간',
          body: '운동이나 연습을 한 번 마칠 때마다 랩을 누르세요. 구간 시간과 누적 기록, 최고·평균·최저 기록을 비교할 수 있습니다. 새로고침하거나 페이지를 떠나기 전에 CSV로 다운로드하세요. 일부 브라우저는 기기 절전 중 측정이 멈출 수 있습니다.',
        },
        {
          heading: '키보드 조작',
          body: '스페이스로 시작 또는 일시정지하고, L로 랩을 기록하며, 일시정지 상태에서 R로 초기화합니다.',
        },
      ],
    },
    timer: {
      title: '온라인 타이머 및 카운트다운',
      meta: '프리셋, 일시정지, 시간 추가, 반복, 소리, 알림, 전체 화면을 지원하는 카운트다운 타이머입니다.',
      eyebrow: '집중할 시간을 정하세요',
      heading: '온라인 타이머',
      intro:
        '프리셋이나 원하는 시간으로 시작하세요. 자주 쓰는 시간을 저장하고, 새로고침 후에도 카운트다운을 이어가며, 브라우저 탭에서 남은 시간을 확인할 수 있습니다.',
      sections: [
        {
          heading: '매일 쓰는 타이머 저장하기',
          body: '차 우리기 3분, 집중 시간 25분처럼 자주 쓰는 시간을 정하고 내 타이머에서 이름을 붙여 저장하세요. 다음 방문에 선택하거나 링크를 북마크할 수 있습니다. 이 탭을 새로고침해도 실행 중인 카운트다운을 복원합니다.',
        },
        {
          heading: '알림과 소리',
          body: '알림은 사용자가 직접 선택할 때만 권한을 요청합니다. 브라우저 자동 재생 정책이나 닫히고 중단된 페이지에서는 소리와 알림이 보장되지 않습니다.',
        },
      ],
    },
    alarm: {
      title: '여러 알람을 지원하는 온라인 알람 시계',
      meta: '라벨, 요일 반복, 소리, 스누즈, 로컬 저장, 선택적 알림을 지원하는 브라우저 알람입니다.',
      eyebrow: '브라우저에 저장되는 알람',
      heading: '온라인 알람 시계',
      intro: '여러 알람을 만들고 반복 요일과 소리를 선택해 이 브라우저에 저장합니다.',
      sections: [
        {
          heading: '중요한 브라우저 제한',
          body: '일반 웹페이지는 브라우저, 탭, 기기 또는 운영체제가 페이지를 중단하거나 종료한 뒤 알람 실행을 보장할 수 없습니다. 중요한 알림에는 기기의 기본 알람을 사용하세요.',
        },
        {
          heading: '로컬 저장',
          body: '알람 설정은 이 브라우저에만 저장됩니다. 계정이나 서버 데이터베이스가 없으므로 다른 기기와 동기화되지 않습니다.',
        },
      ],
    },
    'world-clock': {
      title: '세계 시계 – 세계 현재 시간',
      meta: '세계 시간대를 검색하고 저장해 현재 현지 시간, UTC 오프셋, 날짜 차이를 비교하고 순서를 바꾸세요.',
      eyebrow: '실시간 세계 시간 비교',
      heading: '세계 시계',
      intro: '여러 시간대의 현지 시간과 UTC 오프셋, 이전 날과 다음 날 여부를 한눈에 비교합니다.',
      sections: [
        {
          heading: '표준 시간대 데이터',
          body: '브라우저의 Intl 구현과 IANA 시간대 식별자를 사용합니다. 일광 절약 시간과 과거 오프셋 규칙을 직접 하드코딩하지 않습니다.',
        },
        {
          heading: '내 위치 목록',
          body: '동료나 가족이 사는 도시를 추가하세요. 서울, 뉴욕, London처럼 검색하거나 목록에서 IANA 시간대를 선택할 수 있습니다. 기준 도시를 맨 위에 두면 그 도시를 기준으로 날짜 차이를 표시합니다. 다음 방문에도 목록과 순서가 유지됩니다.',
        },
      ],
    },
    'time-zone-converter': {
      title: '시간대 변환 및 시차 계산기',
      meta: '날짜와 시간을 여러 IANA 시간대로 변환하고 DST 오프셋과 이전 날·다음 날 표시를 확인하세요.',
      eyebrow: 'DST 반영 시간 변환',
      heading: '시간대 변환기',
      intro: '한 지역의 날짜와 시간을 여러 목적지로 변환하고 UTC 오프셋과 날짜 변경을 확인합니다.',
      sections: [
        {
          heading: '일광 절약 시간',
          body: '고정 오프셋 대신 브라우저 표준을 통한 IANA 시간대를 사용하므로 플랫폼 데이터에 따른 계절별 일광 절약 시간 변경을 반영합니다.',
        },
        {
          heading: '중복되거나 존재하지 않는 시간',
          body: '뉴욕의 2026년 3월 8일 02:30은 존재하지 않고, 11월 1일 01:30은 두 번 발생합니다. 존재하지 않는 시간은 안내하고, 중복 시각은 오프셋을 선택하도록 합니다. 결과 링크에는 날짜, 목적지, 선택한 시각이 보존됩니다.',
        },
      ],
    },
  },
};
