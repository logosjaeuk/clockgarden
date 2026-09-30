import type { Locale } from '../config';
import type { ToolKey } from './toolPages';
export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  callout?: string;
}
export interface ArticleCopy {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedDate: string;
  modifiedDate: string;
  readTimeMinutes: number;
  relatedTool: ToolKey;
  heroLead: string;
  sections: ArticleSection[];
  takeaways: string[];
  sources: Array<{ label: string; url: string }>;
}
export const articleSlugs = [
  'circadian-rhythms-and-screen-light',
  'browser-timer-drift-and-monotonic-clocks',
  'remote-teams-timezone-overlap',
  'neuroscience-of-the-pomodoro-technique',
  'leap-seconds-and-atomic-time',
  'behind-living-clock-crafting-digital-zen',
] as const;
export type ArticleSlug = (typeof articleSlugs)[number];
export const articles: Record<Locale, Record<ArticleSlug, ArticleCopy>> = {
  en: {
    'circadian-rhythms-and-screen-light': {
      slug: 'circadian-rhythms-and-screen-light',
      title: 'Setting up a readable evening desk clock',
      description:
        'Choose a theme, reduce visual movement, and understand what a browser clock can and cannot change about your display.',
      category: 'Display guide',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'clock',
      heroLead:
        'For an evening desk clock, start with readable digits and your device brightness controls. Clock Garden changes page colors and scenery; it does not measure screen brightness, filter wavelengths, or provide a sleep treatment.',
      sections: [
        {
          heading: 'Start with the room and the display',
          paragraphs: [
            "Open the clock at your usual viewing distance. Adjust device brightness until the digits are readable without dominating the room, then choose the light or dark page theme. Page colors cannot override your monitor's brightness setting.",
            'Switch off milliseconds if the changing digits distract you. Seconds can also be hidden. The best setting is the one you can read comfortably during the task; there is no measured health benefit claimed for this theme.',
          ],
        },
        {
          heading: 'Choose between numbers and scenery',
          paragraphs: [
            "The digital view gives the clearest time display. Living Clock adds illustrated or drawn environments that change with the device's hour. These are artistic day cycles, not local sunrise calculations or live weather.",
            'In Living Clock, Browse scenes lets you choose and favorite a scene. The day preview temporarily displays a different time. Return to current time before using it as a desk clock.',
          ],
        },
        {
          heading: 'Keep the screen on only when needed',
          paragraphs: [
            'Use Fullscreen to enlarge the instrument and Keep screen awake if your browser offers it. Wake lock is a request: the browser or system can release it, especially when the page is no longer visible.',
            'After switching tabs, check the setting again. Turn it off when finished. Leaving any illuminated display on uses power; Clock Garden has not measured battery or light-emission savings.',
          ],
        },
        {
          heading: 'Troubleshoot an uncomfortable setup',
          paragraphs: [
            "If the display looks crowded, hide milliseconds and the analog face, leave fullscreen, or try the numeric view. For reduced decorative movement, enable your operating system's reduced-motion preference.",
            'This guide replaces earlier unsupported claims about melatonin, sleep stages, and percentage reductions in light emission. The product provides display controls, not medical advice or a verified sleep intervention.',
          ],
        },
      ],
      takeaways: [
        'Adjust brightness on the device itself.',
        'Hide fast-changing digits if they distract you.',
        'Check wake lock after returning to the tab.',
        'Scene previews do not show the current time.',
      ],
      sources: [
        {
          label: 'MDN: Screen Wake Lock API',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API',
        },
      ],
    },
    'browser-timer-drift-and-monotonic-clocks': {
      slug: 'browser-timer-drift-and-monotonic-clocks',
      title: 'Why a browser timer can finish late',
      description:
        "How Clock Garden's stopwatch and countdown calculate time, what happens in hidden tabs, and how to test an alert before relying on it.",
      category: 'Timing guide',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'timer',
      heroLead:
        'The number on a countdown and the delivery of its alert are separate things. Clock Garden calculates remaining time from a deadline, but a browser can delay the code that plays the completion sound.',
      sections: [
        {
          heading: 'A delayed redraw is not an extra second',
          paragraphs: [
            'Suppose you start a ten-minute timer at 14:00 and return at 14:07. A deadline-based countdown compares the saved 14:10 endpoint with the current device time and shows about three minutes remaining.',
            'Counting one second per callback would undercount time whenever callbacks are delayed. Clock Garden instead uses targetAt minus Date.now() for the countdown, so it does not depend on receiving every scheduled callback.',
          ],
        },
        {
          heading: 'The stopwatch uses a different clock',
          paragraphs: [
            "The stopwatch computes active elapsed time from performance.now() plus previously accumulated time. This monotonic clock avoids jumps from changing the device's wall clock.",
            "The countdown uses wall-clock timestamps so it can restore its deadline after a refresh. Changing the device time can therefore affect it. Neither approach guarantees that the screen updates or a user's click is captured with millisecond accuracy.",
          ],
        },
        {
          heading: 'What happens in background tabs and sleep',
          paragraphs: [
            'Browsers reduce work on hidden pages, and a suspended page may execute no code. Returning to the timer lets it calculate the remaining time again; this does not mean a sound played at the original deadline.',
            'For a practical check, start a one-minute timer, switch tabs, and note when you hear it. Repeat with your usual battery settings. This checks your current setup only, not every browser or future session.',
          ],
        },
        {
          heading: 'What survives a refresh',
          paragraphs: [
            "A countdown saves its state in session storage and can resume in the same tab when storage is available. A stopwatch's laps are page memory: export the CSV before refreshing.",
            'A closed tab is not a dependable alarm service. For a deadline you cannot miss, use a native device alarm too. Displaying three decimal places is a format choice, not evidence of a calibrated instrument.',
          ],
        },
      ],
      takeaways: [
        'Countdown: saved deadline minus device time.',
        'Stopwatch: accumulated active time plus a monotonic interval.',
        'Late callbacks can delay sounds even when the display catches up.',
        'Export laps before leaving the page.',
      ],
      sources: [
        {
          label: 'MDN: performance.now()',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Performance/now',
        },
        {
          label: 'MDN: Page Visibility API',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API',
        },
      ],
    },
    'remote-teams-timezone-overlap': {
      slug: 'remote-teams-timezone-overlap',
      title: 'Plan a meeting across time zones without a date mistake',
      description:
        'A worked Seoul, Tokyo, and London example, plus a workflow for daylight-saving gaps, repeated hours, and shared conversion links.',
      category: 'Time-zone guide',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'time-zone-converter',
      heroLead:
        "Choose the meeting date before calculating the time difference. The world clock answers 'what time is it now?'; the converter answers 'what time will this dated event be in each location?'.",
      sections: [
        {
          heading: 'Use a dated example',
          paragraphs: [
            "For 15 January 2026, 09:00 in Europe/London corresponds to 18:00 in both Asia/Seoul and Asia/Tokyo. For 15 July 2026, 09:00 in London corresponds to 17:00 in both cities under the browser's time-zone rules.",
            'Seoul and Tokyo share UTC+09:00 in these examples. An earlier version of this guide incorrectly gave different times for them. Recalculate for the actual event date rather than copying a seasonal offset.',
          ],
        },
        {
          heading: 'Enter the event in its source zone',
          paragraphs: [
            "Open the converter, choose the source city, and enter the local date and time written on the invitation. Add the destination cities. Check each result's date and UTC offset as well as its hour.",
            'Use identifiers such as Europe/London or America/New_York rather than CST, which is ambiguous. The browser supplies time-zone data; keep the browser and operating system updated when rules change.',
          ],
        },
        {
          heading: 'Handle skipped and repeated times',
          paragraphs: [
            'Some clock changes skip local times; others repeat an hour. If the converter reports a missing local time, ask the organizer for a valid replacement instead of guessing.',
            'If it offers two offsets, choose the one the organizer intended. A local time without an offset is not enough to identify an occurrence in a repeated hour.',
          ],
        },
        {
          heading: 'Share the decision, not just an hour',
          paragraphs: [
            'Copy the result link after selecting the intended occurrence. Include the date, source zone, and any next-day result in your meeting message. The link stores conversion inputs, not a calendar invitation.',
            'For recurring meetings, check dates on both sides of seasonal transitions. If no convenient overlap exists, rotate the inconvenience or use an asynchronous update; a converter cannot make every local workday overlap.',
          ],
        },
      ],
      takeaways: [
        'Choose the date first.',
        'Seoul and Tokyo have the same time in these examples.',
        'Resolve repeated-hour choices before sharing.',
        'Recheck recurring meetings across clock changes.',
      ],
      sources: [
        {
          label: 'IANA Time Zone Database',
          url: 'https://www.iana.org/time-zones',
        },
      ],
    },
    'neuroscience-of-the-pomodoro-technique': {
      slug: 'neuroscience-of-the-pomodoro-technique',
      title: 'Run a focus session with a 25-minute timer',
      description:
        'A practical work-and-break routine using presets, saved timers, and manual break changes, without productivity or neuroscience guarantees.',
      category: 'Focus guide',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'timer',
      heroLead:
        'A focus timer gives a task a visible boundary. Start with one small outcome, choose a duration you can manage, and review what actually happened when the timer ends. Twenty-five minutes is an option, not a biological requirement.',
      sections: [
        {
          heading: 'Define an outcome before pressing Start',
          paragraphs: [
            "Write a concrete target such as 'outline the introduction' or 'review five practice questions'. Avoid a target as broad as 'finish the project'. Clear one obvious distraction before starting.",
            'Choose 25 minutes if that fits the task, or use a shorter duration for a first attempt. Do not spend the session optimizing timer settings; the timer is a boundary for the work.',
          ],
        },
        {
          heading: 'Set up work and break presets',
          paragraphs: [
            'Select your work duration and start. Save a named preset in My timers if you will reuse it. Leave the tab open and check the sound with a short timer before a longer session.',
            'When work ends, choose five minutes for a break if that suits you. Repeat reuses the same duration; Clock Garden does not automatically alternate work and break lengths.',
          ],
        },
        {
          heading: 'Handle interruption deliberately',
          paragraphs: [
            'If you stop to answer an urgent question, pause the countdown. When you return, decide whether to continue the same task or reset for a new one. Adding a minute changes the deadline, so use it intentionally.',
            'If the device sleeps, the remaining-time display can catch up when the page resumes, but the completion sound may have been delayed. A browser timer is not a record of how long you were concentrating.',
          ],
        },
        {
          heading: 'Review one session before planning the next',
          paragraphs: [
            'At the end, note the result in your own notebook: completed, partly completed, or blocked. Adjust the next duration based on the task rather than forcing every activity into the same pattern.',
            'Clock Garden does not measure attention, diagnose fatigue, or promise a percentage improvement in productivity. This guide replaces earlier unsupported neuroscience claims with a repeatable way to use the timer.',
          ],
        },
      ],
      takeaways: [
        'Pick one observable outcome.',
        'Choose a manageable duration.',
        'Start breaks manually; Repeat keeps the same duration.',
        'Review results in your own notes.',
      ],
      sources: [
        {
          label: 'Clock Garden timer',
          url: '/timer/',
        },
      ],
    },
    'leap-seconds-and-atomic-time': {
      slug: 'leap-seconds-and-atomic-time',
      title: 'Device time, UTC, and why this is not an atomic clock',
      description:
        "Understand what the clock's seconds and milliseconds mean, why server time can differ, and how time-zone conversion uses the same instant.",
      category: 'Clock guide',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'clock',
      heroLead:
        'Clock Garden reads the clock on your device. It does not contact a time server or the server of a ticketing website. If the device time is wrong, the displayed time is wrong too.',
      sections: [
        {
          heading: 'Separate an instant from its local display',
          paragraphs: [
            'JavaScript Date represents an instant as milliseconds relative to an epoch. A time zone controls how that instant is shown as a calendar date and clock time.',
            'World Clock formats the same instant for each selected zone. Changing from Seoul to London changes the local representation, not the moment being compared.',
          ],
        },
        {
          heading: 'More digits do not prove more accuracy',
          paragraphs: [
            'The optional milliseconds are digits from the device clock. The browser cannot paint a new frame for every millisecond, and scheduling delays can postpone the visible update.',
            "For a simple check, compare Clock Garden with the device's own clock. Agreement shows they share a source; it does not show that either is synchronized to an external reference.",
          ],
        },
        {
          heading: 'What to check when the time looks wrong',
          paragraphs: [
            "Check the operating system's date, time zone, and automatic time settings. Then reload the page if you changed the time zone. Clock Garden cannot correct the operating system clock itself.",
            'A remote website may use its own clock and request-processing rules. This tool cannot tell you exactly when that server will accept a registration or ticket request.',
          ],
        },
        {
          heading: 'Where leap seconds fit',
          paragraphs: [
            'JavaScript Date timestamps do not count leap seconds as extra seconds. This display is not designed to show an inserted 23:59:60 second or to compare UTC with an atomic timescale.',
            'Use an authoritative time service for a traceable reference and purpose-built equipment for measurement that requires calibration. This browser display is for everyday time awareness.',
          ],
        },
      ],
      takeaways: [
        'The clock follows your device.',
        'Time zones change the display of an instant.',
        'Millisecond display is not certified accuracy.',
        'This is not a ticketing-server or atomic-time service.',
      ],
      sources: [
        {
          label: 'MDN: JavaScript Date',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date',
        },
      ],
    },
    'behind-living-clock-crafting-digital-zen': {
      slug: 'behind-living-clock-crafting-digital-zen',
      title: 'How Living Clock scenes turn device time into artwork',
      description:
        'A transparent look at canvas scenes, the Blender conservatory, AI-assisted illustrations, and the shared time and preview behavior.',
      category: 'Making Living Clock',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'clock',
      heroLead:
        'Living Clock combines several production methods. Some scenes are drawn in code, Moonlit Conservatory uses locally made Blender renders, and Rainlight and Quiet Study use AI-assisted illustrations with live elements layered over them.',
      sections: [
        {
          heading: 'Three different kinds of artwork',
          paragraphs: [
            'Lantern Isle, Aquarium, and Chrono Garden use canvas drawing. Moonlit Conservatory blends day and night renders of a Blender scene containing the greenhouse, plants, pond, and lamps.',
            "Rainlight's background was generated with an image tool. Quiet Study was edited from a supplied reference with an image tool, leaving a blank desk-clock face for live digits. Calling every scene entirely hand-drawn would misrepresent that process.",
          ],
        },
        {
          heading: 'Which parts actually tell the time',
          paragraphs: [
            'On Lantern Isle, the sky follows the day, sixty lanterns represent minutes, and the boat follows the seconds. Chrono Garden uses 24 hour sectors, flower opening for minutes, and an orbit for seconds.',
            "Rain and fireflies in some other scenes are decorative. Read the common numeric clock and each scene's legend. These effects do not report real rainfall, astronomical sunrise, or your location.",
          ],
        },
        {
          heading: 'Explore a day without changing your device',
          paragraphs: [
            'The day preview sends one chosen time to the scene and the numeric display together. Presets choose the hour with randomized minutes and seconds; the preview returns to current time after 20 seconds.',
            'You can return immediately using the current-time control. This is a visual preview only and does not change operating system time or schedule an alarm.',
          ],
        },
        {
          heading: 'How the scenes stay manageable',
          paragraphs: [
            'Scenes load when selected. The shared renderer pauses when hidden or outside the viewport and limits its frame rate and canvas resolution. Reduced-motion preferences stop decorative movement while the time still updates.',
            'Image scenes can need a network connection when first opened. If loading fails, retry or choose another scene. Performance still depends on the device; the project does not promise zero CPU use or a measured battery saving.',
          ],
        },
      ],
      takeaways: [
        'Artwork provenance differs by scene.',
        'Read the legend for the actual time symbols.',
        'Preview time is temporary and clearly separate from current time.',
        'Reduced motion preserves the time display.',
      ],
      sources: [
        {
          label: 'Clock Garden scene library',
          url: '/clock/?view=living',
        },
      ],
    },
  },
  ko: {
    'circadian-rhythms-and-screen-light': {
      slug: 'circadian-rhythms-and-screen-light',
      title: '저녁 책상 시계를 읽기 편하게 설정하는 방법',
      description: '화면 테마와 움직임 조절, 기기 밝기와 웹 시계의 차이를 설명합니다.',
      category: '화면 사용 안내',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'clock',
      heroLead:
        '저녁 책상 시계는 숫자를 읽을 수 있는 밝기부터 맞추세요. 이 페이지는 화면 밝기를 측정하거나 빛의 파장을 걸러내지 않으며 수면 치료 기능도 없습니다.',
      sections: [
        {
          heading: '기기 밝기부터 조절하기',
          paragraphs: [
            '평소 시계를 볼 거리에서 페이지를 열고 기기 밝기를 조절하세요. 숫자가 잘 보이는 상태에서 밝은 테마나 어두운 테마를 선택합니다.',
            '페이지 색을 바꿔도 모니터 밝기가 바뀌지는 않습니다. 빠른 숫자 변화가 신경 쓰이면 밀리초와 초를 끄세요.',
          ],
        },
        {
          heading: '숫자와 풍경 중 선택하기',
          paragraphs: [
            '숫자 보기는 시간을 빠르게 읽기에 적합합니다. Living Clock은 기기 시간에 따라 변하는 풍경을 더하지만 실제 일출이나 날씨를 계산하지 않습니다.',
            '씬 둘러보기에서 장면을 선택하고 즐겨찾기에 넣으세요. 미리보기 중에는 다른 시각이 보이므로 시간을 읽기 전에 현재 시간으로 돌아오세요.',
          ],
        },
        {
          heading: '필요할 때만 화면 켜두기',
          paragraphs: [
            '전체 화면과 지원되는 브라우저의 화면 켜두기를 사용하세요. 브라우저나 시스템이 요청을 해제할 수 있습니다.',
            '다른 탭에서 돌아오면 상태를 확인하고 사용이 끝나면 끄세요. 켜진 화면은 전력을 사용하며 절감률을 측정하지 않았습니다.',
          ],
        },
        {
          heading: '불편한 표시 줄이기',
          paragraphs: [
            '밀리초와 아날로그 보기를 끄거나 숫자 보기로 바꾸세요. 장식 움직임은 운영체제의 동작 줄이기 설정을 따릅니다.',
            '이 안내는 이전 글의 근거 없는 멜라토닌·수면 단계·광량 감소율 주장을 대체합니다. 화면 설정에 검증된 수면 개선 효과를 주장하지 않습니다.',
          ],
        },
      ],
      takeaways: [
        '밝기는 기기에서 조절하세요.',
        '빠른 숫자는 숨길 수 있습니다.',
        '화면 켜두기 상태를 확인하세요.',
        '미리보기와 현재 시간을 구분하세요.',
      ],
      sources: [
        {
          label: 'MDN: Screen Wake Lock API',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API',
        },
      ],
    },
    'browser-timer-drift-and-monotonic-clocks': {
      slug: 'browser-timer-drift-and-monotonic-clocks',
      title: '브라우저 타이머 종료음이 늦게 울리는 이유',
      description: '카운트다운과 스톱워치의 계산, 숨겨진 탭의 제약과 알림 확인 방법입니다.',
      category: '시간 측정 안내',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'timer',
      heroLead:
        '카운트다운 숫자가 맞는 것과 종료음이 제때 울리는 것은 별개입니다. 종료 시각으로 남은 시간을 계산해도 소리를 실행하는 코드는 브라우저에 의해 지연될 수 있습니다.',
      sections: [
        {
          heading: '종료 시각으로 다시 계산하기',
          paragraphs: [
            '14시에 10분 타이머를 시작해 14시 7분에 돌아오면 저장한 종료 시각과 현재 시간을 비교해 약 3분을 표시합니다.',
            '콜백마다 1초씩 차감하지 않고 targetAt에서 Date.now()를 뺍니다. 따라서 모든 콜백이 정확한 간격으로 실행될 필요는 없습니다.',
          ],
        },
        {
          heading: '스톱워치와 카운트다운의 차이',
          paragraphs: [
            '스톱워치는 performance.now()와 누적 시간을 사용해 기기 시각 변경에 따른 점프를 피합니다.',
            '카운트다운은 새로고침 후 복원할 종료 시각을 사용하므로 기기 시간을 바꾸면 남은 시간도 달라질 수 있습니다. 밀리초 정확도를 보장하지 않습니다.',
          ],
        },
        {
          heading: '숨겨진 탭과 절전 상태',
          paragraphs: [
            '브라우저는 숨겨진 탭의 작업을 줄이며 중단된 페이지는 코드를 실행하지 못할 수 있습니다. 숫자가 복귀 후 따라잡아도 소리가 제때 났다는 뜻은 아닙니다.',
            '실제 환경에서 1분 타이머를 시작하고 다른 탭으로 이동해 소리를 확인하세요. 평소 절전 설정에서도 확인하되 모든 환경에 적용되는 검증은 아닙니다.',
          ],
        },
        {
          heading: '새로고침 전에 보관할 것',
          paragraphs: [
            '카운트다운은 저장소를 사용할 수 있으면 같은 탭에서 복원됩니다. 스톱워치 랩은 페이지 메모리이므로 CSV로 내보내세요.',
            '닫힌 탭의 알림을 보장하지 않습니다. 중요한 마감은 기기 알람도 사용하세요. 세 자리 소수점은 교정된 측정 장비라는 증거가 아닙니다.',
          ],
        },
      ],
      takeaways: [
        '종료 시각과 현재 시간을 비교합니다.',
        '스톱워치는 단조 시계를 사용합니다.',
        '종료음은 지연될 수 있습니다.',
        '랩은 떠나기 전에 내보내세요.',
      ],
      sources: [
        {
          label: 'MDN: performance.now()',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Performance/now',
        },
        {
          label: 'MDN: Page Visibility API',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API',
        },
      ],
    },
    'remote-teams-timezone-overlap': {
      slug: 'remote-teams-timezone-overlap',
      title: '날짜 실수 없이 해외 회의 시간을 정하는 방법',
      description: '서울·도쿄·런던 예시와 일광 절약 시간, 중복 시각, 결과 링크 확인 순서입니다.',
      category: '시간대 안내',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'time-zone-converter',
      heroLead:
        '회의 날짜를 먼저 정하고 시차를 계산하세요. 세계 시계는 현재 시각을, 변환기는 특정 날짜의 회의가 각 지역에서 몇 시인지를 보여줍니다.',
      sections: [
        {
          heading: '날짜가 있는 예시',
          paragraphs: [
            '2026년 1월 15일 런던 09:00은 서울과 도쿄 모두 18:00입니다. 7월 15일 런던 09:00은 브라우저 시간대 규칙상 두 도시에서 모두 17:00입니다.',
            '이 예시에서 서울과 도쿄는 UTC+09:00입니다. 이전 글에서 두 도시 시각을 다르게 표기한 오류를 바로잡았습니다.',
          ],
        },
        {
          heading: '주최 지역에서 시작하기',
          paragraphs: [
            '변환기에서 출발 지역, 현지 날짜와 시각을 입력하고 목적지 도시를 추가하세요. 결과의 날짜와 UTC 오프셋까지 확인하세요.',
            'CST 같은 약어 대신 Europe/London 같은 식별자를 사용하세요. 시간대 데이터가 갱신되도록 브라우저와 운영체제를 업데이트하세요.',
          ],
        },
        {
          heading: '중복되거나 없는 시각',
          paragraphs: [
            '시계 조정으로 특정 시각이 사라지면 주최자에게 유효한 시각을 확인하세요. 임의로 한 시간을 더하지 마세요.',
            '두 오프셋이 나오면 의도한 것을 고르세요. 반복되는 시간에는 현지 시각만으로 실제 순간을 특정할 수 없습니다.',
          ],
        },
        {
          heading: '결정 내용을 공유하기',
          paragraphs: [
            '결과 링크와 함께 날짜, 출발 시간대, 다음 날 여부를 안내하세요. 링크는 변환 입력값을 보존하고 캘린더 초대를 만들지는 않습니다.',
            '정기 회의는 계절 전환 전후 날짜를 각각 확인하세요. 편한 겹침 시간이 없으면 불편한 시간을 번갈아 맡거나 비동기 업데이트를 고려하세요.',
          ],
        },
      ],
      takeaways: [
        '날짜부터 선택하세요.',
        '서울과 도쿄 시각은 같습니다.',
        '오프셋을 고른 뒤 공유하세요.',
        '계절 전환 전후를 확인하세요.',
      ],
      sources: [
        {
          label: 'IANA Time Zone Database',
          url: 'https://www.iana.org/time-zones',
        },
      ],
    },
    'neuroscience-of-the-pomodoro-technique': {
      slug: 'neuroscience-of-the-pomodoro-technique',
      title: '25분 타이머로 집중 시간을 운영하는 방법',
      description:
        '작업을 정하고 집중·휴식을 직접 선택하는 사용법이며 생산성 향상률을 보장하지 않습니다.',
      category: '집중 시간 안내',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'timer',
      heroLead:
        '집중 타이머는 작업에 눈에 보이는 경계를 만듭니다. 작은 목표와 감당할 수 있는 시간을 선택하고 결과를 확인하세요. 25분은 선택지이지 생물학적 필수 조건이 아닙니다.',
      sections: [
        {
          heading: '결과 하나부터 정하기',
          paragraphs: [
            '서론 개요 쓰기나 연습 문제 다섯 개 검토처럼 구체적인 목표를 정하세요. 이번 시간에 확인할 수 있는 범위로 줄이세요.',
            '작업에 맞으면 25분을 선택하고 어렵다면 짧게 시작하세요. 설정을 다듬기보다 작업에 집중하세요.',
          ],
        },
        {
          heading: '집중과 휴식 설정하기',
          paragraphs: [
            '원하는 시간을 선택하고 자주 쓰는 길이는 내 타이머에 저장하세요. 탭을 열어 두고 짧은 타이머로 소리를 확인하세요.',
            '집중 후 필요하면 5분 휴식을 직접 선택하세요. 반복은 같은 길이를 다시 실행하며 집중과 휴식을 자동으로 교대하지 않습니다.',
          ],
        },
        {
          heading: '중단을 의도적으로 처리하기',
          paragraphs: [
            '급한 연락을 처리할 때는 일시정지하고 돌아와 같은 작업을 이어갈지 결정하세요. 시간 추가는 종료 시각을 바꿉니다.',
            '기기 절전 후 숫자는 따라잡아도 소리가 늦을 수 있습니다. 타이머는 실제 집중 시간을 측정하는 장치가 아닙니다.',
          ],
        },
        {
          heading: '다음 세션 전에 검토하기',
          paragraphs: [
            '완료·일부 완료·막힘처럼 결과를 자신의 메모에 남기세요. 작업 특성에 맞게 다음 길이를 조절하세요.',
            '이 도구는 주의력 측정이나 피로 진단을 하지 않습니다. 이전 글의 근거 없는 뇌과학 주장을 실제 사용 순서로 대체했습니다.',
          ],
        },
      ],
      takeaways: [
        '작은 목표를 정하세요.',
        '맞는 길이를 선택하세요.',
        '휴식은 직접 시작하세요.',
        '결과를 메모하세요.',
      ],
      sources: [
        {
          label: 'Clock Garden timer',
          url: '/ko/timer/',
        },
      ],
    },
    'leap-seconds-and-atomic-time': {
      slug: 'leap-seconds-and-atomic-time',
      title: '기기 시간과 UTC: 이 시계가 원자시계는 아닌 이유',
      description: '초와 밀리초의 의미, 서버 시각과의 차이, 같은 순간의 지역별 표시를 설명합니다.',
      category: '시계 기준 안내',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'clock',
      heroLead:
        'Clock Garden은 내 기기 시계를 읽습니다. 표준시 서버나 예매 서버에 접속해 시간을 가져오지 않습니다. 기기 시간이 틀리면 표시 시간도 틀립니다.',
      sections: [
        {
          heading: '순간과 표시 구분하기',
          paragraphs: [
            'JavaScript Date는 기준 시점으로부터의 밀리초로 한 순간을 표현합니다. 시간대는 그 순간을 어느 날짜와 시각으로 표시할지 정합니다.',
            '세계 시계는 같은 순간을 지역별로 표시합니다. 서울에서 런던으로 바꿔도 비교하는 순간은 같습니다.',
          ],
        },
        {
          heading: '숫자와 정확도의 차이',
          paragraphs: [
            '밀리초는 기기 시계에서 가져온 숫자입니다. 브라우저가 매 밀리초마다 화면을 그리지는 않으며 갱신이 늦을 수 있습니다.',
            '기기 시계와 값이 같아도 외부 기준시와 동기화됐다는 증거는 아닙니다. 같은 원천을 사용한다는 확인입니다.',
          ],
        },
        {
          heading: '잘못 보일 때 점검하기',
          paragraphs: [
            '운영체제의 날짜와 시간대, 자동 시간 설정을 확인하세요. 시간대를 바꿨다면 새로고침하세요.',
            '다른 사이트는 자체 서버 시각과 처리 규칙을 사용합니다. 이 도구로 예매나 수강신청의 정확한 접수 순간을 알아낼 수 없습니다.',
          ],
        },
        {
          heading: '윤초와 원자시의 범위',
          paragraphs: [
            'JavaScript Date는 윤초를 추가 초로 세지 않습니다. 이 화면은 23:59:60 표시나 UTC와 원자시 비교를 위해 설계되지 않았습니다.',
            '추적 가능한 기준시에는 공인 시간 서비스를, 교정된 측정에는 목적에 맞는 장비를 사용하세요. 이 시계는 일상적인 시간 확인용입니다.',
          ],
        },
      ],
      takeaways: [
        '기기 시간을 따릅니다.',
        '시간대는 표시를 바꿉니다.',
        '밀리초가 정확도 인증은 아닙니다.',
        '예매 서버 시간이 아닙니다.',
      ],
      sources: [
        {
          label: 'MDN: JavaScript Date',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date',
        },
      ],
    },
    'behind-living-clock-crafting-digital-zen': {
      slug: 'behind-living-clock-crafting-digital-zen',
      title: 'Living Clock은 시간을 어떻게 풍경으로 바꾸나요?',
      description:
        'Canvas 장면, Blender 온실, AI 활용 일러스트의 제작 방식과 미리보기 동작을 공개합니다.',
      category: 'Living Clock 제작 안내',
      publishedDate: '2026-09-26',
      modifiedDate: '2026-09-30',
      readTimeMinutes: 3,
      relatedTool: 'clock',
      heroLead:
        'Living Clock은 여러 제작 방식을 사용합니다. 코드로 그린 장면, 직접 만든 Blender 온실 렌더, AI 도구로 제작·편집한 Rainlight와 Quiet Study 일러스트에 실시간 요소를 더한 장면이 있습니다.',
      sections: [
        {
          heading: '장면마다 다른 제작 방식',
          paragraphs: [
            '등불섬, 수족관, 시간의 정원은 Canvas로 그립니다. 달빛 온실은 Blender에서 만든 온실·식물·연못·등불의 낮과 밤 렌더를 혼합합니다.',
            'Rainlight 배경은 이미지 생성 도구로 만들었으며 Quiet Study는 제공된 참고 그림을 이미지 도구로 편집했습니다. 모든 장면을 순수 수작업이라고 부르면 제작 과정을 잘못 설명하게 됩니다.',
          ],
        },
        {
          heading: '실제로 시간을 나타내는 부분',
          paragraphs: [
            '등불섬의 하늘은 하루, 60개 등불은 분, 배는 초를 나타냅니다. 시간의 정원은 24구역, 꽃의 개화, 반딧불의 공전으로 시·분·초를 표현합니다.',
            '다른 장면의 비나 반딧불은 장식일 수 있습니다. 숫자 시계와 범례를 확인하세요. 실제 날씨나 천문학적 일출을 나타내는 효과가 아닙니다.',
          ],
        },
        {
          heading: '기기 시간을 바꾸지 않는 미리보기',
          paragraphs: [
            '하루 미리보기는 장면과 숫자에 같은 시각을 전달합니다. 프리셋은 시를 선택하고 분·초는 무작위로 정하며 20초 뒤 현재 시간으로 돌아갑니다.',
            '현재 시간 버튼으로 즉시 돌아갈 수 있습니다. 운영체제 시간을 바꾸거나 알람을 예약하는 기능이 아닙니다.',
          ],
        },
        {
          heading: '장면을 실행하는 방식',
          paragraphs: [
            '선택한 장면을 불러오고 숨겨지거나 화면 밖으로 벗어나면 공유 렌더러를 멈춥니다. 프레임 수와 해상도를 제한하고 동작 줄이기 설정에서는 장식 이동을 멈춥니다.',
            '이미지 장면은 첫 로딩에 연결이 필요할 수 있습니다. 실패하면 재시도하거나 다른 장면을 고르세요. CPU 사용량 0이나 측정된 배터리 절감률을 약속하지 않습니다.',
          ],
        },
      ],
      takeaways: [
        '제작 방식은 장면마다 다릅니다.',
        '시간 기호는 범례를 확인하세요.',
        '미리보기는 임시 시각입니다.',
        '동작 줄이기에서도 시간은 갱신됩니다.',
      ],
      sources: [
        {
          label: 'Clock Garden scene library',
          url: '/ko/clock/?view=living',
        },
      ],
    },
  },
};
