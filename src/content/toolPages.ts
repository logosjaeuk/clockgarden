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
      title: 'Clock with Seconds – Live Current Local Time',
      meta: 'See your current device time with seconds, milliseconds, 12/24-hour mode, analog display, fullscreen ambient mode, and Living Clock art.',
      eyebrow: 'Precision Device Time & Ambient Living Clock',
      heading: 'Clock with seconds and live art',
      intro:
        'Read your exact device time with sub-second precision, or enter Living Clock: handcrafted atmospheric environments where lighting, lanterns, and scenery shift with the hour.',
      shortcuts: [
        { key: 'F', action: 'Toggle fullscreen ambient desk clock' },
        { key: '12 / 24', action: 'Switch between 12-hour and 24-hour time' },
        { key: 'Seconds', action: 'Show or hide live second counter' },
        { key: 'Milliseconds', action: 'Toggle millisecond precision' },
      ],
      sections: [
        {
          heading: 'Hardware Clock Synchronization vs. NTP Atomic Standard',
          body: 'Clock Garden reads your computer or mobile hardware clock directly on every animation frame with zero calculation lag. To ensure your display matches atomic standard time down to the exact millisecond, ensure your operating system has automatic network time synchronization (NTP) enabled.',
          list: [
            'Time-sensitive events: Essential for university course registrations, concert ticketing, and flash sales.',
            'Drift-free rendering: Calculated from hardware timestamps rather than naive interval loops.',
            'Offline reliability: Functions smoothly even when disconnected from the internet.',
          ],
        },
        {
          heading: 'Ambient Fullscreen Mode for Focus & Study Desks',
          body: 'Turn your tablet, laptop, or secondary monitor into an elegant desktop clock. Press F or click the fullscreen icon to hide browser chrome, displaying crisp minimalist typography designed for viewing from across the room. Combined with our Screen Wake Lock feature, your display stays awake without requiring permanent changes to your operating system power settings.',
        },
        {
          heading: 'Living Clock: Handcrafted Artwork Driven by Solar Time',
          body: 'Time in nature is never static—it breathes with light, weather, and the cycle of the sun. Clock Garden features Living Clock: an art collection built using 3D modeling in Blender and procedural canvas shaders. From dawn twilight and midday sun to golden hour dusk and starlit night, the scenery transitions seamlessly to mirror your local hour.',
        },
        {
          heading: '12-Hour vs. 24-Hour (Military) Time & Millisecond Precision',
          body: 'Switch effortlessly between 12-hour civil time and 24-hour military time to avoid AM/PM ambiguities in international communication, aviation, and software scheduling. For performance testing or high-speed visual measurement, enable milliseconds to view 1/1000th-of-a-second increments.',
        },
      ],
      faqs: [
        {
          question: 'Is this online clock synchronized with official atomic time?',
          answer:
            'Clock Garden reflects your device’s internal hardware clock with zero calculation latency. To match official atomic time down to the millisecond, ensure your operating system has automatic time synchronization enabled using an NTP server (such as pool.ntp.org or time.apple.com).',
        },
        {
          question: 'How does the Screen Wake Lock feature work?',
          answer:
            'When you toggle Keep screen awake, Clock Garden requests a temporary wake lock from your browser. This keeps the display illuminated for study or desk clock use without permanently modifying your computer’s system sleep settings.',
        },
        {
          question: 'What is Living Clock, and how do I access it?',
          answer:
            'Living Clock is our signature animated art installation. Click the Living Clock button on the clock page or choose a scene from the Scene Library to view handcrafted environments that breathe, illuminate, and shift with the time of day.',
        },
        {
          question: 'Does this clock consume significant battery or CPU in the background?',
          answer:
            'No. Clock Garden uses lightweight requestAnimationFrame rendering that automatically pauses or throttles when the tab is hidden or minimized, preserving your laptop or mobile battery life.',
        },
        {
          question: 'Can I use this clock completely offline without an internet connection?',
          answer:
            'Yes. Once the page is loaded, Clock Garden’s service worker caches all static assets. You can open and run the clock without Wi-Fi or cellular data, reading your local device hardware time.',
        },
      ],
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
      title: 'Online Alarm Clock – Multiple Alarms & Sleep Cycles',
      meta: 'Set multiple custom browser alarms with repeat schedules, sleep cycle guides, custom labels, snooze, and local storage.',
      eyebrow: 'Morning Wakeups, Daily Routines & Sleep Cycles',
      heading: 'Online alarm clock with multiple alarms',
      intro:
        'Create multiple custom alarms with weekday repeats and audio chimes. Save your daily schedules locally in this browser without accounts or tracking.',
      shortcuts: [
        { key: 'New Alarm', action: 'Create a custom scheduled alarm' },
        { key: 'Toggle', action: 'Activate or silence existing alarm' },
        { key: 'Snooze', action: 'Delay ringing alarm by 5 minutes' },
        { key: 'Delete', action: 'Remove alarm from local browser storage' },
      ],
      sections: [
        {
          heading: 'Sleep Hygiene & The 90-Minute REM Sleep Cycle',
          body: 'Human sleep architecture alternates between non-REM deep sleep and REM (dream) sleep in cycles lasting roughly 90 minutes. Waking up during deep slow-wave sleep triggers sleep inertia, leaving you feeling groggy and exhausted for hours.',
          list: [
            '4 Sleep Cycles (6 Hours): Ideal for short rest nights while still waking during lighter sleep stages.',
            '5 Sleep Cycles (7.5 Hours): The optimal restorative target for most healthy adults.',
            '6 Sleep Cycles (9 Hours): Recommended after intense physical exertion or during recovery.',
          ],
        },
        {
          heading: 'Structuring Recurring Daily Routines & Medication Alarms',
          body: 'Beyond morning wakeups, recurring alarms serve as powerful cognitive anchors throughout the workday. Set distinct alarms for morning hydration, mid-afternoon posture stretching, critical medication schedules, or an evening shutdown routine to signal your brain that the workday is officially over.',
        },
        {
          heading: 'Critical Browser Limitations & Operating System Sleep Notice',
          body: 'Standard web browsers operate inside sandboxed environments and cannot force your computer hardware to wake up from deep sleep or hibernation. If you close your laptop lid or your device enters low-power standby, browser timer scripts are paused by the operating system. For critical morning appointments, always set your phone’s hardware alarm as a primary backup.',
        },
        {
          heading: 'Private Local Storage & Zero Server Telemetry',
          body: 'Your alarm times, day schedules, and personalized labels are stored exclusively in your browser’s localStorage. There is no user tracking, no third-party cloud database, and no synchronization between devices, guaranteeing total privacy for your personal sleep and work habits.',
        },
      ],
      faqs: [
        {
          question: 'Will the online alarm ring if my laptop screen turns off or the computer goes to sleep?',
          answer:
            'If your computer enters deep operating system sleep or hibernation, the browser cannot run audio scripts. To ensure the alarm rings, keep your device awake or use the Keep screen awake toggle on the clock page. For critical wakeups, always set a native phone alarm.',
        },
        {
          question: 'Do I need to keep this browser tab open for the alarm to sound?',
          answer:
            'Yes. Web browser security sandboxes prevent closed tabs from executing background code. Keep the tab open in your browser; you can minimize the window or work in other applications.',
        },
        {
          question: 'Can I set multiple alarms with different repeat days?',
          answer:
            'Yes. You can create multiple custom alarms, name them with personalized labels, choose distinct weekday repeat patterns (e.g., Monday through Friday), and pick your preferred chime.',
        },
        {
          question: 'Why is there no sound when the alarm triggers?',
          answer:
            'Web browsers require a user interaction (such as clicking on the page) before permitting audio autoplay. If you just opened the tab, click anywhere on the page or test the alarm sound to ensure audio permissions are active.',
        },
        {
          question: 'Are my alarm labels and times kept private?',
          answer:
            'Yes. All alarm entries are saved purely in your browser’s local storage. There is no account system and no remote database—your daily routines remain 100% private to your device.',
        },
      ],
    },
    'world-clock': {
      title: 'World Clock – Current Local Time Around the World',
      meta: 'Search and compare live world time zones, calculate global meeting overlaps, manage remote teams, and track UTC offsets.',
      eyebrow: 'Live Global Comparison & Remote Team Collaboration',
      heading: 'World clock and international time comparator',
      intro:
        'Search and pin cities across the globe. Compare live local times, calculate date differences, and find golden overlapping hours for distributed teams.',
      shortcuts: [
        { key: 'Search City', action: 'Filter by city name or IANA time zone identifier' },
        { key: 'Order', action: 'Top city acts as reference anchor for day differences' },
        { key: 'Delete', action: 'Remove location from local browser storage' },
      ],
      sections: [
        {
          heading: 'Coordinating Remote Distributed Teams Across Time Zones',
          body: 'As modern organizations operate across North America, Europe, and Asia-Pacific, scheduling cross-border collaboration without exhausting teammates requires strategic planning. Use Clock Garden to identify the "Golden Overlap"—the 2-to-3 hour window where distributed teams can hold synchronous standups without forcing late-night overtime.',
          list: [
            'Golden Overlap: 9:00 PM Seoul corresponds to 1:00 PM London and 8:00 AM New York.',
            'Asynchronous Culture: Use synchronous overlap strictly for critical unblocking; rely on documentation for routine updates.',
            'Burnout Prevention: Rotate meeting times so no single continent consistently shoulders evening calls.',
          ],
        },
        {
          heading: 'Reference City & Next-Day / Previous-Day Indicators',
          body: 'Move your home city or your team’s headquarters to the top of the list. All relative date badges (+1 Day or -1 Day) and hour offsets are instantly computed relative to that anchor location, ensuring you never book a meeting on the wrong calendar day.',
        },
        {
          heading: 'Standard IANA Time Zones vs. Ambiguous Abbreviations',
          body: 'Three-letter abbreviations like CST are notoriously ambiguous: CST can represent Central Standard Time (UTC-6 in the US), China Standard Time (UTC+8), or Cuba Standard Time (UTC-5). Clock Garden queries the canonical IANA (Olson) Time Zone Database directly, ensuring legal and astronomical precision.',
        },
        {
          heading: 'Client-Side Persistence for Frequent Collaborators',
          body: 'Your curated list of team cities, relatives abroad, and frequent travel destinations is preserved directly in your browser’s localStorage. There is no account sign-in required, and your location list is restored automatically whenever you return.',
        },
      ],
      faqs: [
        {
          question: 'How do I add a new city or time zone to the World Clock?',
          answer:
            'Use the search bar above the list. You can type common city names (like Seoul, London, Tokyo, or New York) or standard IANA identifiers (like Europe/Paris). Click Add to append it to your saved dashboard.',
        },
        {
          question: 'Why does the order of cities matter in the list?',
          answer:
            'The topmost city serves as your reference anchor. The relative date indicators (+1 Day or -1 Day) and time differences for all other locations are calculated relative to that top city.',
        },
        {
          question: 'How are Daylight Saving Time (DST) changes handled across different countries?',
          answer:
            'Because Clock Garden uses your browser’s standardized IANA database rather than static numerical offsets, seasonal time shifts (such as North American or European summer time transitions) update automatically on the exact legal date and hour.',
        },
        {
          question: 'Is my saved list of world cities transmitted to a server?',
          answer:
            'No. Your list of cities and their custom ordering are stored entirely in your browser’s local storage. No geographic searches or personal location preferences are sent to our servers.',
        },
        {
          question: 'Can I use three-letter abbreviations like EST or PST to search for cities?',
          answer:
            'Three-letter abbreviations are often rejected because they are ambiguous across international borders (for example, CST represents three completely different time zones). We recommend searching by city name (e.g., Chicago) or canonical IANA region (e.g., America/Chicago).',
        },
      ],
    },
    'time-zone-converter': {
      title: 'Time Zone Converter – DST-Aware Time Difference Calculator',
      meta: 'Convert dates and times across multiple IANA time zones with automatic Daylight Saving Time verification, gap warnings, and shareable links.',
      eyebrow: 'DST-Aware Precision & Global Meeting Planner',
      heading: 'Time zone converter and difference planner',
      intro:
        'Convert any local date and time across multiple international destinations. Resolves ambiguous daylight saving hours and creates permanent shareable links.',
      shortcuts: [
        { key: 'Pick Date & Time', action: 'Set original reference moment' },
        { key: 'Swap Cities', action: 'Reverse source and destination with single click' },
        { key: 'Copy Result Link', action: 'Generate shareable link with embedded DST choice' },
      ],
      sections: [
        {
          heading: 'Demystifying Daylight Saving Time: Missing & Repeated Hours',
          body: 'Twice a year, regional time jumps create severe calendar errors. In the spring (Spring Forward), clocks jump from 01:59 to 03:00, meaning 02:30 literally does not exist. In autumn (Fall Back), 01:30 occurs twice. Clock Garden mathematically detects both anomalies, rejecting non-existent hours and prompting you to disambiguate repeated times.',
          list: [
            'Spring Gaps: Alerts you immediately if you enter a time that never occurs due to clocks skipping ahead.',
            'Autumn Duplicates: Offers clear options between the first occurrence (DST) and second occurrence (Standard Time).',
            'Shareable Integrity: Copying the result link permanently locks in your selected DST interpretation.',
          ],
        },
        {
          heading: 'Planning International Webinars & Global Conference Calls',
          body: 'When organizing international product launches or webinars across participants in Tokyo, Sydney, London, and San Francisco, seasonal transitions pose immense risk. Because European and North American DST transitions occur on different calendar weeks in March and November, time differences shift unexpectedly. Use this converter to verify real-time offsets for future dates.',
        },
        {
          heading: 'Standardized UTC Offsets & Fractional Time Zones',
          body: 'While most of the world uses integer hour offsets from Coordinated Universal Time (UTC), several regions operate on half-hour or 45-minute increments. Clock Garden fully supports all fractional zones, including India (UTC+5:30), Iran (UTC+3:30), Nepal (UTC+5:45), and Australia’s Lord Howe Island.',
        },
        {
          heading: 'Shareable Permalinks with Embedded Destination States',
          body: 'Click Copy Result Link to generate a clean, parameterized URL containing your selected source timestamp, reference time zone, added comparison destinations, and chosen DST occurrence. Recipients opening the link see the identical synchronized moment without timezone calculation confusion.',
        },
      ],
      faqs: [
        {
          question: 'Why does the converter warn that a time does not exist?',
          answer:
            'During the spring Daylight Saving Time transition, local clocks skip an entire hour (for example, jumping from 01:59 to 03:00). A local time like 02:30 literally never occurs on that day. Clock Garden protects you from scheduling errors by rejecting non-existent local times.',
        },
        {
          question: 'What should I do if a time occurs twice in the autumn?',
          answer:
            'When clocks fall back in autumn, the repeated hour occurs once during Daylight Saving Time and again 60 minutes later during Standard Time. Clock Garden prompts you to choose the First occurrence or Second occurrence, ensuring complete clarity.',
        },
        {
          question: 'Does the shareable link remember my selected destination cities?',
          answer:
            'Yes. The generated link encodes the source timestamp, source time zone, all added destination zones, and the specific DST disambiguation. Anyone opening the link will see the exact same calculation.',
        },
        {
          question: 'How does this tool handle fractional 30-minute and 45-minute time zones?',
          answer:
            'Clock Garden fully supports fractional IANA time zones, such as India (UTC+5:30), Iran (UTC+3:30), Afghanistan (UTC+4:30), Nepal (UTC+5:45), and Lord Howe Island (30-minute seasonal shift), calculating minute offsets accurately.',
        },
        {
          question: 'Can I swap the source and destination cities with one click?',
          answer:
            'Yes. Click the Swap button between two time zones. The tool maintains the exact underlying moment in time while reversing the reference direction.',
        },
      ],
    },
  },
  ko: {
    clock: {
      title: '초 단위 현재 시간 시계 – 실시간 표준시 및 아트 시계',
      meta: '현재 기기 시간을 초, 밀리초, 12/24시간제, 전체 화면 데스크테리어 시계 및 Living Clock 아트워크와 함께 확인하세요.',
      eyebrow: '정밀 기기 시계 및 감성 앰비언트 Living Clock',
      heading: '초 단위 시계와 살아있는 시계',
      intro:
        '지연 없는 하드웨어 정밀 시간으로 현재 시각을 확인하거나, 태양의 궤적에 따라 빛과 분위기가 실시간으로 변화하는 감성적인 Living Clock 씬을 감상하세요.',
      shortcuts: [
        { key: 'F', action: '전체 화면 탁상시계 모드 전환' },
        { key: '12 / 24', action: '12시간제 및 24시간제 전환' },
        { key: '초 단위', action: '초 단위 표시 켜기 / 끄기' },
        { key: '밀리초', action: '1/1000초 정밀 표시 전환' },
      ],
      sections: [
        {
          heading: '기기 하드웨어 동기화와 인터넷 표준시(NTP) 확인법',
          body: 'Clock Garden은 브라우저의 렌더링 프레임마다 사용자의 컴퓨터 또는 스마트폰 기기 내부 하드웨어 시계를 직접 읽어냅니다. 수강신청, 기차표 예매, 콘서트 티켓팅처럼 1초의 찰나가 중요한 순간에 대비하려면, 운영체제 설정에서 네트워크 시간 프로토콜(NTP) 자동 동기화가 활성화되어 있는지 확인하세요.',
          list: [
            '티켓팅 및 수강신청: 서버 시각과의 오차를 줄이기 위해 기기 시각을 최신 상태로 유지.',
            '누적 오차 없는 렌더링: 단순 타이머 루프가 아닌 하드웨어 타임스탬프 기반 계산.',
            '오프라인 독립성: 인터넷 연결이 끊겨도 기기 시계를 바탕으로 정상 작동.',
          ],
        },
        {
          heading: '데스크테리어 및 몰입을 위한 전체 화면 앰비언트 모드',
          body: '남는 태블릿이나 노트북, 보조 모니터를 미니멀한 감성 탁상시계로 활용해 보세요. F 키를 누르거나 전체 화면 아이콘을 클릭하면 불필요한 브라우저 UI가 모두 숨겨지고, 방 건너편에서도 시원하게 읽히는 정갈한 타이포그래피가 펼쳐집니다. 화면 켜두기(Wake Lock) 옵션과 함께 사용하면 운영체제의 절전 설정을 영구적으로 바꾸지 않고도 작업 내내 디스플레이를 밝게 유지할 수 있습니다.',
        },
        {
          heading: 'Living Clock: 태양의 궤적과 함께 호흡하는 살아있는 시계',
          body: '자연의 시간은 멈추어 있는 숫자가 아닙니다. 시간의 흐름은 빛의 각도와 계절의 공기로 전해집니다. Clock Garden의 Living Clock은 3D Blender 모델링과 절차적 캔버스 셰이더로 제작된 독창적인 디지털 아트입니다. 새벽의 여명, 한낮의 푸른 채광, 해질녘의 붉은 노을, 밤하늘의 고요한 별빛까지 사용자의 실제 시간에 맞춰 배경의 빛과 그림자가 부드럽게 변화합니다.',
        },
        {
          heading: '12시간제 vs 24시간제와 밀리초 정밀도',
          body: '글로벌 화상 회의나 항공, 의료, IT 시스템 관리에서 오전(AM)과 오후(PM)의 혼선을 방지하려면 24시간제를 사용하세요. 또한 브라우저 프레임 렌더링 성능이나 반응 속도를 계측하고 싶다면 밀리초 토글을 켜서 1/1000초 단위의 정밀한 흐름을 눈으로 확인할 수 있습니다.',
        },
      ],
      faqs: [
        {
          question: '이 온라인 시계는 원자시계 표준시와 정확히 일치하나요?',
          answer:
            'Clock Garden은 사용자의 컴퓨터 또는 스마트폰 기기 내부 하드웨어 시계를 딜레이 없이 정밀 렌더링합니다. 공식 표준시와 밀리초 단위까지 정확히 일치시키려면 기기 설정에서 [시간 자동 설정(NTP 동기화)]을 켜두시기 바랍니다.',
        },
        {
          question: '화면 켜두기(Wake Lock) 기능은 안전한가요?',
          answer:
            '네, 완전히 안전합니다. 브라우저의 표준 Screen Wake Lock API를 사용하여 해당 탭이 활성화되어 있는 동안에만 디스플레이 절전을 일시 차단하며, 탭을 닫거나 다른 창으로 이동하면 자동으로 해제됩니다.',
        },
        {
          question: 'Living Clock(살아있는 시계)은 어떻게 이용하나요?',
          answer:
            '시계 화면의 [Living Clock] 버튼을 클릭하거나 씬 라이브러리에서 원하는 배경을 선택하면, 실제 시각의 흐름에 따라 햇살과 등불의 밝기가 실시간으로 변화하는 감성적인 3D 아트 시계로 전환됩니다.',
        },
        {
          question: '배터리나 CPU 소모량이 크지 않나요?',
          answer:
            'Clock Garden은 브라우저의 최적화된 requestAnimationFrame 엔진을 사용하며, 다른 탭으로 이동하거나 창을 최소화하면 렌더링 주기를 자동으로 낮춰 배터리와 시스템 자원 낭비를 완벽히 방지합니다.',
        },
        {
          question: '인터넷이 끊긴 오프라인 상태에서도 작동하나요?',
          answer:
            '네. 서비스 워커를 통해 핵심 정적 에셋이 캐시되므로 비행기 모드나 오프라인 환경에서도 브라우저를 열어 기기 시계를 정상적으로 확인할 수 있습니다.',
        },
      ],
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
      title: '온라인 알람 시계 – 다중 알람 및 90분 수면 주기 기상기',
      meta: '요일별 반복 알람, 90분 REM 수면 주기 가이드, 맞춤형 라벨 메모, 스누즈 및 로컬 저장을 지원하는 온라인 알람 시계입니다.',
      eyebrow: '개운한 아침 기상, 일상 루틴 및 건강한 수면 관리',
      heading: '온라인 알람 시계 (다중 알람)',
      intro:
        '여러 개의 맞춤형 알람을 생성하고 원하는 요일과 알림음을 선택하세요. 회원가입이나 추적 없이 모든 일정은 현재 브라우저에만 안전하게 보관됩니다.',
      shortcuts: [
        { key: '새 알람', action: '원하는 시간의 맞춤 알람 생성' },
        { key: '토글', action: '등록된 알람 켜기 / 끄기' },
        { key: '스누즈', action: '울리는 알람 5분 뒤 다시 울리기' },
        { key: '삭제', action: '브라우저 로컬 저장소에서 알람 제거' },
      ],
      sections: [
        {
          heading: '수면 위생과 90분 생체 주기(REM) 기상법',
          body: '사람의 수면은 얕은 수면, 깊은 서파 수면, 그리고 꿈을 꾸는 렘(REM) 수면이 약 90분 주기로 순환합니다. 깊은 숙면 단계에서 강제로 깨어나면 수면 관성(Sleep Inertia)으로 인해 뇌가 쉽게 각성하지 못하고 온종일 무기력해질 수 있습니다.',
          list: [
            '4회 수면 주기 (6시간): 비교적 짧게 자더라도 얕은 수면 타이밍에 맞춰 상쾌하게 일어나는 루틴.',
            '5회 수면 주기 (7시간 30분): 성인에게 가장 이상적인 면역력 회복과 뇌 휴식 권장 시간.',
            '6회 수면 주기 (9시간): 격렬한 육체 운동 후나 피로 누적 시 권장되는 충분한 숙면 주기.',
          ],
        },
        {
          heading: '다중 알람을 활용한 일상 루틴 및 복약 시간 관리',
          body: '단순한 아침 기상 외에도, 요일별 반복 알람은 일상의 강력한 행동 트리거가 됩니다. 기상 후 미온수 마시기, 오후 3시 거북목 스트레칭, 필수 영양제 복약 시간, 그리고 퇴근 무렵 하루 업무를 정리하는 리추얼 알람으로 하루의 리듬을 체계화하세요.',
        },
        {
          heading: '브라우저의 기술적 한계와 컴퓨터 절전 모드 주의사항',
          body: '웹 브라우저는 샌드박스 보안 정책상 컴퓨터의 메인보드 전원을 직접 켜거나 절전 모드를 해제할 권한이 없습니다. 노트북 덮개를 닫거나 컴퓨터가 시스템 절전(Sleep) 상태에 진입하면 브라우저의 오디오 및 타이머 실행이 운영체제에 의해 일시 중단됩니다. 중요한 시험, 비행기 탑승 등 필수 일정에는 스마트폰의 하드웨어 알람을 메인으로 병행하시기 바랍니다.',
        },
        {
          heading: '외부 서버 전송 없는 100% 로컬 개인정보 보호',
          body: '설정한 알람 시간, 반복 요일, 라벨 이름은 전적으로 사용자의 브라우저 로컬 저장소(localStorage)에만 기록됩니다. 중앙 서버나 클라우드로 전송되지 않으므로 개인의 사적인 생활 패턴과 수면 데이터가 철저히 보호됩니다.',
        },
      ],
      faqs: [
        {
          question: '노트북 덮개를 닫거나 컴퓨터가 절전 모드에 들어가도 알람이 울리나요?',
          answer:
            '운영체제가 하드웨어 절전(Sleep) 상태에 진입하면 브라우저의 코드 실행이 중단되므로 알람이 울리지 않습니다. 밤새 알람을 켜두시려면 전원을 연결하고 화면 켜두기 옵션을 활용하시거나, 중요한 기상에는 스마트폰의 하드웨어 기본 알람을 병행해 주세요.',
        },
        {
          question: '브라우저 탭을 닫아도 알람이 울리나요?',
          answer:
            '웹 브라우저의 보안 정책상 탭이 닫히면 해당 페이지의 코드는 완전히 종료됩니다. 알람이 동작하려면 탭이 브라우저 창에 열려 있어야 합니다(창을 최소화하거나 다른 작업을 하는 것은 가능합니다).',
        },
        {
          question: '요일별로 다른 알람을 여러 개 등록할 수 있나요?',
          answer:
            '네. 평일(월~금) 출근 알람, 주말 기상 알람, 매일 오후 물 마시기 알람 등 원하는 요일과 라벨을 지정하여 여러 개의 알람을 자유롭게 추가하고 관리할 수 있습니다.',
        },
        {
          question: '알람 시간이 되었는데 소리가 나지 않는 이유는 무엇인가요?',
          answer:
            '현대 브라우저는 페이지 방문 후 사용자의 클릭이나 키보드 입력이 한 번도 없었던 경우 배경 탭의 오디오 자동 재생을 차단합니다. 탭을 열었을 때 알람 테스트 버튼을 누르거나 화면을 한 번 클릭해 두시면 오디오 권한이 정상 유지됩니다.',
        },
        {
          question: '알람에 설정한 이름과 시간은 안전하게 보호되나요?',
          answer:
            '네. 설정한 모든 알람 데이터는 귀하의 컴퓨터 브라우저 내부 로컬 저장소에만 보관됩니다. 계정 가입이 필요 없고 외부 서버로 전송되지 않으므로 개인의 수면 습관과 루틴이 완벽히 보호됩니다.',
        },
      ],
    },
    'world-clock': {
      title: '세계 시계 – 실시간 전 세계 현지 시간 및 시차 비교',
      meta: '전 세계 도시의 실시간 현지 시간 비교, 글로벌 미팅 골든 오버랩 시간대 계산, IANA 표준 시차 확인 및 즐겨찾는 도시 저장을 지원합니다.',
      eyebrow: '글로벌 시차 비교 및 원격 근무 협업 도구',
      heading: '세계 시계 및 글로벌 시차 비교기',
      intro:
        '세계 주요 도시의 현지 시간을 실시간으로 비교하고 나만의 목록을 관리하세요. 기준 도시를 바탕으로 날짜 차이와 글로벌 협업을 위한 최적의 미팅 시간을 즉시 확인합니다.',
      shortcuts: [
        { key: '도시 검색', action: '한글/영문 도시명 또는 IANA 시간대 검색' },
        { key: '순서 조정', action: '맨 위 도시가 날짜 차이의 기준 도시로 지정' },
        { key: '삭제', action: '브라우저 로컬 저장소에서 도시 제거' },
      ],
      sections: [
        {
          heading: '글로벌 원격 근무와 시차 겹침(Golden Overlap) 전략',
          body: '아시아, 유럽, 북미에 흩어져 있는 글로벌 분산 팀과 협업할 때 가장 큰 장벽은 시차로 인한 피로도입니다. Clock Garden을 활용하여 대륙 간 팀원들이 야근이나 새벽 기상 없이 실시간 소통을 진행할 수 있는 2~3시간의 "골든 오버랩(Golden Overlap)" 시간대를 발굴하세요.',
          list: [
            '골든 오버랩 예시: 서울 오후 9시는 런던 오후 1시, 뉴욕 오전 8시에 해당합니다.',
            '비동기(Async) 협업 문화: 실시간 회의는 필수 블로커 해결에 집중하고, 일상 업무 공유는 12~24시간 비동기 문서로 대체.',
            '번아웃 예방: 특정 대륙의 팀원만 지속적으로 야간 콜에 참석하지 않도록 미팅 시간대를 정기적으로 순환.',
          ],
        },
        {
          heading: '기준 도시 설정과 날짜 차이(+1일 / -1일) 직관적 확인',
          body: '본인이 거주하는 도시나 회사의 본사를 드래그하여 목록 맨 위에 배치하세요. 다른 모든 도시의 "+1일" 또는 "-1일" 날짜 뱃지와 시간 차이가 최상단 기준 도시를 바탕으로 실시간 자동 계산되어, 글로벌 회의나 항공편 예약 시 날짜 착오를 원천 방지합니다.',
        },
        {
          heading: '공식 IANA 시간대 표준과 모호한 3자리 약어(CST 등)의 위험성',
          body: 'CST와 같은 3자리 약어는 미국 중부 표준시(UTC-6), 중국 표준시(UTC+8), 쿠바 표준시(UTC-5) 등 서로 완전히 다른 3개 지역을 의미할 수 있어 심각한 혼선을 야기합니다. Clock Garden은 전 세계 표준인 IANA(Olson) 시간대 데이터베이스를 충실히 조회하므로, 지리적·천문학적으로 정확한 표준시를 보장합니다.',
        },
        {
          heading: '회원가입 없는 로컬 저장소 목록 영구 보존',
          body: '자주 협업하는 동료와 해외 친척이 거주하는 도시 목록, 그리고 커스텀 정렬 순서는 사용자의 브라우저 localStorage에 안전하게 보존됩니다. 계정 로그인 없이도 다음 방문 시 동일한 목록을 즉시 이용할 수 있습니다.',
        },
      ],
      faqs: [
        {
          question: '세계 시계에 새로운 도시를 추가하려면 어떻게 하나요?',
          answer:
            '상단 검색창에 서울, 뉴욕, London, Tokyo처럼 한글 또는 영문 도시명을 입력하거나 공식 IANA 시간대를 검색한 뒤 [추가] 버튼을 누르면 나만의 세계 시계 목록에 즉시 등록됩니다.',
        },
        {
          question: '도시 목록의 순서를 바꾸는 것이 왜 중요한가요?',
          answer:
            '목록의 가장 첫 번째에 위치한 도시가 [기준 도시]가 됩니다. 다른 모든 도시의 +1일, -1일과 같은 날짜 차이 표시가 이 최상단 도시를 기준으로 자동 계산되기 때문입니다.',
        },
        {
          question: '각국의 서머타임(일광 절약 시간)은 자동으로 반영되나요?',
          answer:
            '네. 고정된 숫자 오프셋 대신 브라우저 표준 IANA 데이터베이스를 사용하므로, 미국, 유럽 등 각국의 법정 서머타임 시작일과 종료일에 맞춰 시각이 1초의 오차 없이 자동으로 변경됩니다.',
        },
        {
          question: '내가 등록한 도시 목록이 서버에 저장되거나 추적되나요?',
          answer:
            '아닙니다. 추가한 모든 도시와 순서 데이터는 오직 사용자의 브라우저 로컬 저장소에만 보관됩니다. 어떠한 검색 기록이나 위치 정보도 서버로 전송되지 않습니다.',
        },
        {
          question: '왜 EST, CST 같은 3글자 약어로 검색되지 않는 경우가 있나요?',
          answer:
            '3자리 시간대 약어는 국가마다 동일한 약어를 다른 시간대에 사용하는 경우가 많아(예: CST는 미국, 중국, 쿠바에서 각각 다른 시차를 의미) 혼선을 초래합니다. 가장 정확한 검색을 위해 도시 이름(예: 뉴욕, 시카고, 베이징)으로 입력하시기를 권장합니다.',
        },
      ],
    },
    'time-zone-converter': {
      title: '시간대 변환 및 시차 계산기 – DST 반영 미팅 플래너',
      meta: '전 세계 IANA 시간대 간 날짜 및 시각 변환, 서머타임 누락/중복 시간 검증, 30분 단위 특수 시차 계산 및 결과 공유 링크 생성을 지원합니다.',
      eyebrow: 'DST 정밀 검증 및 글로벌 회의 일정 플래너',
      heading: '시간대 변환 및 시차 계산기',
      intro:
        '기준 날짜와 시각을 여러 목적지 시간대로 즉시 변환하세요. 서머타임으로 인한 누락 및 중복 시각을 정확히 안내하며, 영구적인 결과 공유 링크를 생성합니다.',
      shortcuts: [
        { key: '날짜/시각 선택', action: '변환할 원본 기준 일시 지정' },
        { key: '지역 맞바꾸기', action: '원클릭으로 출발지와 목적지 교환' },
        { key: '결과 링크 복사', action: '선택한 DST 상태가 포함된 영구 공유 링크 생성' },
      ],
      sections: [
        {
          heading: '서머타임(DST)의 함정: 존재하지 않는 시간과 중복되는 시간',
          body: '일 년에 두 번, 서머타임(일광 절약 시간) 전환 주간에는 캘린더 예약에 심각한 오류가 발생합니다. 봄철 시작일에는 시계가 1시간 앞당겨지며(Spring Forward) 01:59에서 03:00으로 건너뛰어 02:30 같은 시각은 아예 존재하지 않습니다. 반대로 가을철 종료일에는 시계를 1시간 뒤로 돌려(Fall Back) 01:30이 두 번 발생합니다. Clock Garden은 이 두 가지 예외를 완벽히 감지하여, 없는 시각은 사전에 차단하고 중복 시각은 첫 번째(서머타임)인지 두 번째(표준시)인지 선택하도록 안내합니다.',
          list: [
            '봄철 누락 시각: 서머타임으로 인해 발생하지 않는 시간을 입력하면 즉시 경고하여 일정 오류 예방.',
            '가을철 중복 시각: 첫 번째 발생(DST)과 두 번째 발생(표준시) 중 의도한 시점을 명확히 선택 가능.',
            '공유 링크 신뢰성: 결과 링크를 복사하면 선택한 DST 옵션까지 영구 보존되어 받는 사람도 동일한 시각 확인.',
          ],
        },
        {
          heading: '글로벌 웨비나 및 다국가 화상 미팅 기획 가이드',
          body: '서울, 도쿄, 런던, 샌프란시스코 참가자를 아우르는 글로벌 행사 기획 시, 3월과 11월의 서머타임 전환 주간은 대단히 위험합니다. 미국과 유럽의 서머타임 적용 일자가 1~2주가량 차이 나기 때문에 평소와 시차가 달라지기 때문입니다. Clock Garden을 통해 미래 행사 날짜의 실제 시차를 사전에 정확히 시뮬레이션하세요.',
        },
        {
          heading: '협정 세계시(UTC) 오프셋과 30분·45분 분 단위 특수 시간대',
          body: '대부분의 국가는 1시간 단위 정수 오프셋을 사용하지만, 인도(UTC+5:30), 이란(UTC+3:30), 아프가니스탄(UTC+4:30), 네팔(UTC+5:45), 호주 로드하우섬(30분 단위 서머타임) 등은 분 단위 특수 시차를 적용합니다. Clock Garden은 이러한 특수 시간대까지 완벽히 지원합니다.',
        },
        {
          heading: 'DST 선택 상태까지 포함되는 완벽한 결과 공유 링크',
          body: '[결과 링크 복사] 버튼을 누르면 기준 일시, 출발 시간대, 추가된 모든 비교 목적지, 그리고 서머타임 중복 선택 상태가 쿼리스트링에 깔끔하게 인코딩된 URL이 생성됩니다. 링크를 전달받은 상대방도 변환 계산 착오 없이 동일하게 동기화된 일정을 확인할 수 있습니다.',
        },
      ],
      faqs: [
        {
          question: '왜 어떤 날짜와 시간을 입력하면 존재하지 않는 시간이라고 안내하나요?',
          answer:
            '봄철 서머타임이 시작되는 날에는 시계가 1시간 앞당겨지면서 1시간이 사라집니다(예: 01:59 다음이 03:00으로 건너뜀). 따라서 해당 날짜의 02:30 같은 시각은 물리적으로 존재하지 않으므로, 미팅 예약 착오를 막기 위해 변환을 차단하고 안내합니다.',
        },
        {
          question: '가을철에 같은 시각이 두 번 발생할 때는 어떻게 처리하나요?',
          answer:
            '가을철 서머타임이 해제될 때는 시계 바늘을 1시간 뒤로 돌리므로 01시~02시 구간이 2회 발생합니다. Clock Garden은 첫 번째(서머타임) 발생인지 두 번째(표준시) 발생인지 선택할 수 있는 옵션을 제공하여 모호함을 완전히 제거합니다.',
        },
        {
          question: '결과 링크를 복사해서 다른 사람에게 공유하면 어떻게 보이나요?',
          answer:
            '공유 링크에는 날짜, 기준 시간대, 목적지 도시 목록 및 선택한 서머타임 상태가 완벽히 저장되어 있습니다. 링크를 전달받은 상대방도 동일한 변환 결과를 즉시 확인하고 본인의 현지 시간과 비교할 수 있습니다.',
        },
        {
          question: '30분이나 45분 차이가 나는 특수 시간대(인도, 네팔 등)도 지원하나요?',
          answer:
            '네. 인도(UTC+5:30), 네팔(UTC+5:45), 이란(UTC+3:30) 등 정수 시차가 아닌 전 세계 모든 표준 IANA 시간대를 완벽하게 지원합니다.',
        },
        {
          question: '기준 도시와 목적지 도시를 한 번에 맞바꿀 수 있나요?',
          answer:
            '네. 변환 결과 박스의 [맞바꾸기] 버튼을 누르면 계산된 실제 시점(순간)을 유지한 채 출발지와 목적지가 즉시 교환되어 양방향 시차 확인이 매우 간편합니다.',
        },
      ],
    },
  },
};
