import type { Locale } from '../config';

export type ToolKey =
  'clock' | 'stopwatch' | 'timer' | 'alarm' | 'world-clock' | 'time-zone-converter';
export interface FAQItem {
  question: string;
  answer: string;
}

export interface KeyboardShortcut {
  key: string;
  action: string;
}

export interface ToolPageCopy {
  title: string;
  meta: string;
  eyebrow: string;
  heading: string;
  intro: string;
  shortcuts?: KeyboardShortcut[];
  sections: Array<{ heading: string; body: string; list?: string[] }>;
  faqs: FAQItem[];
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
      faqs: [],
    },
    stopwatch: {
      title: 'Online Stopwatch with Laps – High-Precision Split Timer',
      meta: 'Run a precise online stopwatch with millisecond accuracy, lap splits, pace analysis, CSV export, and keyboard shortcuts.',
      eyebrow: 'Athletics, Interval Training & Split Analysis',
      heading: 'Online stopwatch with laps',
      intro:
        'Track elapsed time with microsecond-level accuracy, recorded lap intervals, automated performance statistics, and instant CSV data export.',
      shortcuts: [
        { key: 'Space', action: 'Start / Pause timing' },
        { key: 'L', action: 'Record lap split' },
        { key: 'R', action: 'Reset stopwatch (when paused)' },
      ],
      sections: [
        {
          heading: 'High-Intensity Interval Training & Pacing',
          body: 'Whether sprinting on the track, swimming laps, or executing Tabata intervals, accurate timing is essential for cardiovascular conditioning. Use the lap button at the end of each round to monitor pace degradation and aerobic threshold consistency.',
          list: [
            'HIIT intervals: 30-second maximum effort followed by 90-second recovery sprints.',
            'Track pacing: Record 400m splits to evaluate lap consistency against target split times.',
            'Tabata sprints: 8 cycles of 20 seconds maximum effort and 10 seconds active rest.',
          ],
        },
        {
          heading: 'Lap Duration vs. Cumulative Split Time',
          body: 'Every recorded lap displays both interval duration (time elapsed since the previous split) and cumulative split time (total time elapsed from start). The automated analytics banner highlights your best (fastest) lap in vibrant green, slowest lap in amber, and computes your rolling average in real time.',
        },
        {
          heading: 'Data Export for Training Logs & Lab Experiments',
          body: 'Need to archive your workout or analyze timing data in spreadsheets? Click the Download CSV button after recording your splits. The generated CSV file includes clean, machine-readable columns for Lap Number, Interval Duration, and Cumulative Time—ready to open in Microsoft Excel, Google Sheets, or Python pandas.',
        },
        {
          heading: 'Monotonic Hardware Time & Zero Clock Drift',
          body: 'Many web stopwatches rely on basic JavaScript interval counters that drift significantly when background tabs throttle or CPU load spikes. Clock Garden computes elapsed time exclusively from the hardware-backed window.performance.now() API, ensuring sub-millisecond mathematical precision unaffected by system wall-clock adjustments or NTP updates.',
        },
      ],
      faqs: [
        {
          question: 'How accurate is this online stopwatch?',
          answer:
            'The stopwatch measures elapsed time using the browser’s high-resolution monotonic performance.now() API, which delivers microsecond-level internal precision and updates visual frames at your monitor’s native refresh rate (60Hz to 144Hz).',
        },
        {
          question: 'Can I export my recorded laps for further analysis in spreadsheets?',
          answer:
            'Yes. After recording two or more laps, click the Download CSV button. A structured spreadsheet file will instantly download to your device containing lap numbers, split intervals, and cumulative elapsed times.',
        },
        {
          question: 'Why is the Reset button disabled while the stopwatch is running?',
          answer:
            'This is an intentional fail-safe design. To prevent accidental data loss during vigorous athletic exercise or scientific measurement, the stopwatch must be paused (via Space or the Pause button) before reset can be triggered.',
        },
        {
          question: 'Will my lap times be saved if I close or refresh this browser tab?',
          answer:
            'Stopwatch splits are held in volatile browser session memory for maximum responsiveness. If you need to preserve your recorded workout or lab session, make sure to click Download CSV before leaving or refreshing the page.',
        },
        {
          question: 'Can I operate the stopwatch entirely from my keyboard?',
          answer:
            'Yes. Press the Spacebar to Start or Pause, press L to split a lap, and press R while paused to Reset. All shortcuts work instantly without needing to click specific UI buttons.',
        },
      ],
    },
    timer: {
      title: 'Online Timer and Countdown – Focus & Kitchen Timer',
      meta: 'Set an online countdown timer with presets, Pomodoro focus mode, sound alerts, repeat intervals, and tab-title status.',
      eyebrow: 'Work Sessions, Study Sprints & Everyday Routines',
      heading: 'Online timer and countdown',
      intro:
        'Start with one-click presets or custom durations. Save your everyday routines, preserve countdowns through accidental refreshes, and track time directly in the browser tab.',
      shortcuts: [
        { key: 'Space', action: 'Start / Pause countdown' },
        { key: '+1m', action: 'Extend time by 1 minute' },
        { key: '+5m', action: 'Extend time by 5 minutes' },
        { key: 'Reset', action: 'Restore initial preset duration' },
      ],
      sections: [
        {
          heading: 'Mastering Deep Work with the Pomodoro Technique',
          body: 'The Pomodoro Technique, created by Francesco Cirillo, breaks complex projects into 25-minute sprints of undivided focus followed by 5-minute cognitive rests. After four consecutive sprints, reward yourself with an extended 15 to 30-minute break. This rhythm maintains optimal prefrontal cortex stamina and mitigates mental fatigue.',
          list: [
            'Sprint (25 min): Choose a single task. Silence non-essential notifications and work with zero multitasking.',
            'Short Rest (5 min): Step away from your monitor, stretch, hydrate, or rest your eyes.',
            'Long Rest (20-30 min): Take a brisk walk or enjoy a healthy snack after completing four cycles.',
          ],
        },
        {
          heading: 'The 2-Minute Rule to Defeat Procrastination',
          body: 'Drawn from David Allen’s Getting Things Done (GTD) methodology, the 2-Minute Rule states that if a task takes less than two minutes, you should execute it immediately. When facing intimidating projects, set the timer for just 2 minutes and commit to working until the chime sounds—taking that initial step almost always sparks momentum.',
        },
        {
          heading: 'Culinary Recipes & Beverage Brewing Precision',
          body: 'Proper extraction requires strict timing. Use Clock Garden presets to achieve consistent culinary perfection:',
          list: [
            'Pour-over coffee: 30-second bloom followed by complete draw-down at 2m 45s to 3m 15s.',
            'Delicate green tea: 2 minutes steep at 75°C to preserve amino acids and prevent bitterness.',
            'Robust black tea & herbal infusions: 4 to 5 minutes steep at 95°C for rich, full-bodied flavor.',
            'Soft-boiled eggs: Exactly 6 minutes 30 seconds straight from refrigerator to rolling boil.',
          ],
        },
        {
          heading: 'Background Tab Throttling & Session Resilience',
          body: 'Modern browsers deliberately throttle inactive background tabs to conserve battery. Unlike fragile timer widgets that fall behind when you switch tabs, Clock Garden calculates remaining duration against an absolute epoch timestamp stored in sessionStorage. Your countdown stays accurate down to the second even after refreshing the page or switching applications.',
        },
      ],
      faqs: [
        {
          question: 'Will my countdown timer keep running if I switch to another tab or minimize the browser?',
          answer:
            'Yes. Clock Garden records the exact target end-timestamp in your tab’s session storage. When you return to the tab, the display instantly resynchronizes with your device hardware clock, bypassing all background tab throttling.',
        },
        {
          question: 'Why didn’t the audio alarm sound when my timer finished?',
          answer:
            'Modern browsers enforce strict autoplay policies that block background audio unless you have interacted with the webpage during the session. Clicking Start or adjusting settings grants the browser audio permission for the chime.',
        },
        {
          question: 'How many custom timers can I save in My Timers?',
          answer:
            'You can save up to 8 custom named timers in your browser’s local storage. They persist across visits without requiring an account, and each saved timer generates a direct shareable URL containing your duration settings.',
        },
        {
          question: 'Can I use this timer for high-intensity interval workouts (HIIT)?',
          answer:
            'Yes. Enable the Repeat toggle on the timer. Upon reaching zero, the timer will chime and immediately restart from your original duration, creating automated work or rest intervals.',
        },
        {
          question: 'Does the timer send operating system desktop notifications?',
          answer:
            'If you enable the Notification toggle and grant browser permission, Clock Garden dispatches a native desktop or mobile notification when your countdown ends, ensuring you never miss a deadline while working in another app.',
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
      faqs: [],
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
      faqs: [],
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
      faqs: [],
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
      faqs: [],
    },
    stopwatch: {
      title: '온라인 스톱워치 – 밀리초 랩 기록 및 구간 측정',
      meta: '밀리초 단위 정밀 측정, 랩 스플릿 기록, 최고/최저/평균 통계, CSV 내보내기 및 키보드 단축키를 지원하는 온라인 스톱워치입니다.',
      eyebrow: '육상, 인터벌 훈련, 페이스 분석 및 실험 측정',
      heading: '온라인 스톱워치 (랩 기록)',
      intro:
        '단조 하드웨어 시계를 바탕으로 한 마이크로초 수준의 정밀 시간 측정, 랩 구간 기록, 자동 성과 통계 및 CSV 데이터 내보내기를 지원합니다.',
      shortcuts: [
        { key: '스페이스바', action: '측정 시작 / 일시정지' },
        { key: 'L 키', action: '구간(랩) 기록' },
        { key: 'R 키', action: '초기화 (일시정지 상태에서만 동작)' },
      ],
      sections: [
        {
          heading: '고강도 인터벌(HIIT) 및 타바타 페이스 트레이닝',
          body: '트랙 달리기, 수영, 사이클링 또는 고강도 인터벌 트레이닝(HIIT)에서 정확한 구간 계측은 심폐 능력과 페이스 조절의 핵심입니다. 라운드가 끝날 때마다 랩 버튼을 눌러 심박 회복과 페이스 저하율을 모니터링하세요.',
          list: [
            'HIIT 인터벌: 30초 전력 질주 후 90초간의 불완전 휴식 반복.',
            '트랙 페이스: 400m 구간 랩을 측정하여 목표 랩 타임과의 일관성 평가.',
            '타바타 프로토콜: 20초 최대 운동과 10초 휴식을 8세트 반복하는 4분 루틴.',
          ],
        },
        {
          heading: '구간 랩 타임(Lap)과 누적 스플릿(Split)의 차이',
          body: '기록된 각 행에는 직전 랩 이후 순수하게 소요된 구간 시간(Lap Duration)과 출발점부터의 총 누적 경과 시간(Split Total)이 함께 표시됩니다. 실시간 통계 배너를 통해 가장 빨랐던 최고 랩(Best), 가장 느렸던 랩(Slowest), 그리고 전체 평균 랩(Average)을 한눈에 비교할 수 있습니다.',
        },
        {
          heading: '훈련 일지 및 실험 기록을 위한 CSV 내보내기',
          body: '랩을 1회 이상 기록한 후 [CSV 다운로드] 버튼을 누르면 랩 번호, 구간 시간, 누적 시간이 포함된 표준 CSV 파일이 즉시 저장됩니다. 마이크로소프트 엑셀(Excel), 구글 스프레드시트 또는 데이터 분석 도구로 불러와 그래프로 시각화할 수 있습니다.',
        },
        {
          heading: '단조 하드웨어 시계(performance.now)와 제로 누적 오차',
          body: '시중의 많은 웹 스톱워치는 브라우저 백그라운드 탭이 절전 모드에 들어가면 심각하게 지연되는 단순 인터벌 타이머를 사용합니다. Clock Garden은 하드웨어 기반의 window.performance.now() API를 사용하여 컴퓨터 시스템 시각 변경이나 인터넷 동기화로 인한 왜곡 없이 마이크로초 수준의 수학적 정밀도를 보장합니다.',
        },
      ],
      faqs: [
        {
          question: '이 온라인 스톱워치의 시간 측정 정밀도는 어느 정도인가요?',
          answer:
            '브라우저의 고해상도 단조 시계(performance.now) API를 사용하여 마이크로초 단위의 정밀도로 경과 시간을 추적하며, 화면에는 10밀리초(1/100초) 단위로 부드럽게 갱신됩니다.',
        },
        {
          question: '기록한 랩 데이터를 엑셀이나 스프레드시트로 옮길 수 있나요?',
          answer:
            '네. 랩을 1개 이상 기록한 뒤 [CSV 다운로드] 버튼을 누르면 랩 번호, 구간 시간, 누적 스플릿 시간이 정돈된 스프레드시트 파일로 즉시 저장됩니다.',
        },
        {
          question: '스톱워치가 동작 중일 때 왜 초기화(Reset) 버튼이 눌리지 않나요?',
          answer:
            '격렬한 운동이나 중요한 계측 중 실수로 초기화 버튼을 잘못 눌러 소중한 기록이 날아가는 것을 방지하기 위한 안전장치입니다. 스페이스바나 일시정지 버튼을 눌러 정지시킨 후에만 초기화가 활성화됩니다.',
        },
        {
          question: '키보드 단축키를 사용할 수 있나요?',
          answer:
            '네. 마우스 클릭 없이 스페이스바(시작/일시정지), L(랩 기록), R(일시정지 중 초기화) 단축키로 신속하게 제어할 수 있습니다.',
        },
        {
          question: '페이지를 새로고침하거나 탭을 닫아도 스톱워치 랩이 유지되나요?',
          answer:
            '스톱워치 기록은 실시간 반응 속도와 메모리 보호를 위해 현재 세션 메모리에 보관됩니다. 중요한 측정 결과는 페이지를 닫거나 새로고침하기 전에 반드시 CSV로 다운로드해 두시기를 권장합니다.',
        },
      ],
    },
    timer: {
      title: '온라인 타이머 및 카운트다운 – 뽀모도로 및 집중 타이머',
      meta: '뽀모도로 25분 집중, 2분 규칙, 요리/차 추출 프리셋, 자동 반복, 소리 알림, 탭 제목 시간 표시를 지원하는 온라인 타이머입니다.',
      eyebrow: '집중 업무, 학습 스프린트, 운동 및 일상 루틴',
      heading: '온라인 타이머 및 카운트다운',
      intro:
        '원클릭 프리셋이나 원하는 시간으로 시작하세요. 자주 쓰는 루틴을 저장하고, 새로고침 후에도 카운트다운을 이어가며, 브라우저 탭에서 남은 시간을 확인할 수 있습니다.',
      shortcuts: [
        { key: '스페이스바', action: '카운트다운 시작 / 일시정지' },
        { key: '+1분', action: '집중 중 1분 연장' },
        { key: '+5분', action: '집중 중 5분 연장' },
        { key: '초기화', action: '처음 설정 시간으로 리셋' },
      ],
      sections: [
        {
          heading: '뽀모도로(Pomodoro) 기법으로 극대화하는 몰입도',
          body: '프란체스코 시릴로가 고안한 뽀모도로 기법은 25분의 절대적 집중과 5분의 인지적 휴식을 번갈아 배치하는 시간 관리 방법입니다. 4회의 스프린트를 완료한 뒤에는 15~30분의 긴 휴식을 취합니다. 이 규칙적인 리듬은 뇌의 전두엽 피로도를 낮추고 장시간 몰입을 유지하도록 돕습니다.',
          list: [
            '집중 스프린트 (25분): 한 가지 작업만 선택하고 모든 방해 요소를 차단한 채 멀티태스킹 없이 몰입합니다.',
            '짧은 휴식 (5분): 모니터에서 눈을 떼고 가벼운 스트레칭을 하거나 물을 마십니다.',
            '긴 휴식 (20~30분): 4세트 완료 후 산책이나 가벼운 간식을 즐기며 뇌를 완전히 재충전합니다.',
          ],
        },
        {
          heading: '미루는 습관을 정복하는 2분 규칙',
          body: '데이비드 앨런의 GTD(Getting Things Done) 생산성 철학에서 유래한 2분 규칙은, 2분 안에 끝낼 수 있는 간단한 일은 메모하지 말고 즉시 실행하라는 지침입니다. 거대하고 두려운 프로젝트 앞에서는 타이머를 딱 2분에 맞추고 "알람이 울릴 때까지만 시작해보자"는 마음으로 착수하세요. 첫 2분의 벽을 넘어서면 마찰력이 사라지고 지속할 추진력이 생깁니다.',
        },
        {
          heading: '요리와 음료 추출을 위한 정밀 타이머 레시피',
          body: '식재료의 맛과 향은 몇 초의 추출 차이로 결정됩니다. Clock Garden 프리셋을 활용해 완벽한 미식을 즐기세요:',
          list: [
            '핸드드립 커피: 30초 뜸 들이기 후 2분 30초~3분 15초 사이 추출 완료.',
            '섬세한 녹차: 75°C 온수에서 정확히 2분 침출하여 떫은맛 억제 및 아미노산 보존.',
            '풍부한 홍차 및 허브티: 95°C 온수에서 4~5분 침출하여 깊은 바디감 추출.',
            '완벽한 반숙 달걀: 냉장고에서 꺼낸 달걀을 끓는 물에 넣고 정확히 6분 30초 삶기.',
          ],
        },
        {
          heading: '브라우저 백그라운드 스로틀링과 세션 복원 기술',
          body: '현대 브라우저는 배터리 절약을 위해 비활성 탭의 실행 주기를 강제로 지연(Throttling)시킵니다. 다른 탭으로 이동했을 때 시간이 느려지는 일반 타이머와 달리, Clock Garden은 브라우저 sessionStorage에 완료 예정 절대 시각(targetAt)을 기록합니다. 실수로 새로고침을 누르거나 다른 앱을 오가더라도 1초의 오차 없이 정확한 남은 시간을 복원합니다.',
        },
      ],
      faqs: [
        {
          question: '다른 탭으로 이동하거나 창을 최소화해도 타이머가 정상 작동하나요?',
          answer:
            '네, 정상 작동합니다. Clock Garden은 단순 초 카운트 대신 브라우저 세션 저장소에 완료 예정 절대 시각을 기록합니다. 탭으로 돌아왔을 때 기기 시계와 즉시 동기화되므로 백그라운드 탭 지연 오차가 전혀 발생하지 않습니다.',
        },
        {
          question: '타이머 종료 알림음이 울리지 않는 이유는 무엇인가요?',
          answer:
            '현대 웹 브라우저는 사용자의 클릭이나 조작이 선행되지 않은 웹페이지의 오디오 자동 재생을 엄격히 차단합니다. 페이지 방문 후 시작 버튼을 누르거나 화면을 한 번 조작해야 브라우저 오디오 권한이 정상 활성화됩니다.',
        },
        {
          question: '자주 쓰는 맞춤 타이머는 몇 개까지 저장할 수 있나요?',
          answer:
            '이름을 지정한 타이머를 최대 8개까지 브라우저 로컬 저장소에 영구 보관할 수 있습니다. 별도 회원가입 없이 다음 방문 시 즉시 불러올 수 있으며, 타이머 시간이 포함된 공유 링크도 복사할 수 있습니다.',
        },
        {
          question: '인터벌 운동이나 반복 집중 세션에 활용할 수 있나요?',
          answer:
            '네. [반복] 옵션을 켜두시면 카운트다운이 0에 도달했을 때 알림음과 함께 자동으로 처음 설정된 시간으로 돌아가 다시 시작되므로 타바타, 홈트레이닝, 스트레칭 루틴에 이상적입니다.',
        },
        {
          question: '화면이 꺼지지 않게 유지할 수 있나요?',
          answer:
            '지원되는 브라우저에서 [화면 켜두기(Wake Lock)] 옵션을 켜면 요리나 시험 공부 중 화면이 자동으로 잠들거나 어두워지는 것을 방지할 수 있습니다.',
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
      faqs: [],
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
      faqs: [],
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
      faqs: [],
    },
  },
};
