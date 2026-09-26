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
  readTimeMinutes: number;
  relatedTool: ToolKey;
  heroLead: string;
  sections: ArticleSection[];
  takeaways: string[];
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
      title: 'The Science of Circadian Rhythms & Screen Light: How Displays Alter Sleep Architecture',
      description:
        'Explore the neurobiology of intrinsically photosensitive retinal ganglion cells, melatonin suppression curves, and how ambient display modes protect cognitive circadian rhythms.',
      category: 'Chronobiology & Health',
      publishedDate: '2026-09-20',
      readTimeMinutes: 7,
      relatedTool: 'clock',
      heroLead:
        'Human biology evolved under astronomical light cycles. When computer monitors emit intense narrow-spectrum blue light after dusk, our central circadian clock misinterprets evening hours as midday, disrupting deep REM cycles and restorative sleep architecture.',
      sections: [
        {
          heading: 'The Suprachiasmatic Nucleus and Melatonin Suppression',
          paragraphs: [
            'Deep within the hypothalamus sits the suprachiasmatic nucleus (SCN), a master pacemaker consisting of approximately 20,000 neurons that orchestrates our 24-hour physiological rhythm. The SCN coordinates body temperature fluctuations, cortisol secretion, and cellular metabolic regeneration.',
            'Light exposure regulates the SCN through specialized photoreceptors in the eye called intrinsically photosensitive retinal ganglion cells (ipRGCs). These cells contain the photopigment melanopsin, which displays peak sensitivity to narrow-band blue light between 460 and 480 nanometers—precisely the dominant emission spectrum of LED-backlit computer monitors.',
          ],
          callout:
            'Exposure to 480nm blue light in the 2 hours before bed can delay natural melatonin release by up to 90 minutes, fragmenting rapid eye movement (REM) sleep architecture.',
        },
        {
          heading: 'Digital Eye Strain and the 20-20-20 Protective Rule',
          paragraphs: [
            'Prolonged screen focus causes asthenopia, commonly known as digital eye strain. When concentrating on luminous monitors, human blink rates plummet from an average of 15–18 blinks per minute down to less than 5 blinks per minute, accelerating corneal tear film evaporation.',
            'Optometrists emphasize the 20-20-20 ergonomic protocol: every 20 minutes, shift your gaze to an object at least 20 feet away for 20 seconds. This allows the ciliary muscles within the eye lens to relax from constant near-point accommodation.',
          ],
        },
        {
          heading: 'OLED Black, Low-Contrast Ambient Displays, and Desk Clocks',
          paragraphs: [
            'Standard desktop clock widgets often blast full-spectrum white pixels with glaring contrast, creating unnecessary cognitive arousal during evening study or late-night desk sessions.',
            'Clock Garden was engineered with a dedicated OLED dark mode and warm ambient scenes. By replacing harsh white backgrounds with deep charcoal tones (#10110f) and subdued amber/green accents, total photonic emission is reduced by over 80% on OLED and Mini-LED panels.',
          ],
        },
        {
          heading: 'Practical Evening Workspace Ergonomics',
          paragraphs: [
            'To maintain peak circadian health without sacrificing late-evening productivity, align your physical desk environment with progressive dimming. Pair warm room bias lighting (2700K or lower) with low-luminance fullscreen clock displays.',
            'Enabling full-screen ambient mode on your auxiliary monitor provides peaceful time awareness without triggering the neuroendocrine alertness spikes caused by jarring white-themed utility apps.',
          ],
        },
      ],
      takeaways: [
        'ipRGC photoreceptors in the human retina are tuned to 460–480nm blue light emitted by standard monitors.',
        'Evening screen exposure delays pineal melatonin secretion and degrades deep stage-3 slow-wave sleep.',
        'OLED dark themes and warm ambient displays significantly reduce photic retinal stress during evening work.',
        'Implement the 20-20-20 rule to preserve tear film integrity and ciliary muscle accommodation.',
      ],
    },

    'browser-timer-drift-and-monotonic-clocks': {
      slug: 'browser-timer-drift-and-monotonic-clocks',
      title: 'Why Browser Timers Drift: Monotonic Clocks vs CPU Throttling in JavaScript',
      description:
        'A deep technical look into why setInterval accumulates cumulative drift, how operating systems throttle background tabs, and how monotonic clocks guarantee sub-millisecond precision.',
      category: 'Software Engineering',
      publishedDate: '2026-09-21',
      readTimeMinutes: 8,
      relatedTool: 'stopwatch',
      heroLead:
        'Most naive web countdowns and stopwatches lose several seconds per hour when minimized. Understanding the distinction between wall-clock epoch time, setInterval tick queues, and monotonic hardware clocks is essential for high-precision time instruments.',
      sections: [
        {
          heading: 'The Fallacy of Recursive setInterval',
          paragraphs: [
            'Many beginner web applications implement countdown timers by incrementing an internal counter inside a 1,000ms `setInterval` or `setTimeout` loop. This approach is inherently flawed due to JavaScript’s single-threaded event loop architecture.',
            'If the main thread is occupied by DOM manipulation, style recalculation, or garbage collection, the timer callback is delayed in the Macrotask Queue. Because `setInterval` schedules the next interval relative to execution rather than an absolute baseline, delays accumulate monotonically—a phenomenon known as cumulative time drift.',
          ],
          callout:
            'A naive setInterval timer running in an active tab can drift by 1.2 to 3.5 seconds every 30 minutes under heavy CPU or memory load.',
        },
        {
          heading: 'Aggressive Background Tab Throttling by Modern Browsers',
          paragraphs: [
            'To extend laptop battery life and reduce fan noise, modern browser engines (Chromium, WebKit, Gecko) aggressively throttle inactive background tabs. Timers in background tabs are clamped to fire no more than once per second (1,000ms), and in some power-saving states, once per minute.',
            'If a web stopwatch relies on counting ticks, minimizing the tab or switching to another window causes the timer to freeze or fall dramatically behind actual elapsed physical time.',
          ],
        },
        {
          heading: 'Monotonic Hardware Clocks and performance.now()',
          paragraphs: [
            'System clocks (`Date.now()`) report wall-clock time relative to Unix epoch (January 1, 1970). However, wall-clock time is non-monotonic: it can jump backward or forward when the operating system synchronizes with Network Time Protocol (NTP) servers or adjusts for daylight saving.',
            'For high-precision duration measurement, modern engines provide the High Resolution Time API (`performance.now()`). This returns milliseconds elapsed since an arbitrary origin, backed by the CPU’s hardware monotonic counter (such as x86 RDTSC). It is strictly non-decreasing and immune to system clock adjustments.',
          ],
        },
        {
          heading: 'The Clock Garden Precision Architecture',
          paragraphs: [
            'Clock Garden instruments reject tick-counting completely. When a stopwatch or countdown starts, the engine records an absolute target epoch timestamp alongside high-resolution `performance.now()` reference marks in `sessionStorage`.',
            'On every animation frame or tab wake event, elapsed time is computed as `targetTime - currentTime`. Even if the browser suspends the background tab for three hours, the instant you return, the display evaluates the exact elapsed duration with sub-millisecond accuracy.',
          ],
        },
      ],
      takeaways: [
        'Recursive setInterval loops suffer from cumulative drift caused by event loop macrotask delays.',
        'Browser power-saving heuristics throttle background tab timer execution to 1,000ms or slower.',
        'Date.now() is non-monotonic and subject to NTP clock stepping and manual user adjustments.',
        'High-precision web tools store absolute target timestamps and calculate delta offsets via performance.now().',
      ],
    },

    'remote-teams-timezone-overlap': {
      slug: 'remote-teams-timezone-overlap',
      title: 'Mastering Asynchronous Collaboration: Golden Overlap Across 12 Timezones',
      description:
        'How distributed engineering teams navigate ambiguous 3-letter abbreviations, daylight saving jump gaps, and find the Golden Overlap window for frictionless global teamwork.',
      category: 'Productivity & Remote Work',
      publishedDate: '2026-09-22',
      readTimeMinutes: 6,
      relatedTool: 'world-clock',
      heroLead:
        'When teams stretch across San Francisco, London, Seoul, and Sydney, traditional 9-to-5 synchronous collaboration collapses. Structuring your workday around asynchronous handoffs and explicit IANA time zone anchors turns global distance into a round-the-clock superpower.',
      sections: [
        {
          heading: 'The Trap of Ambiguous 3-Letter Abbreviations',
          paragraphs: [
            'Calendar invites often specify "10:00 AM CST". However, "CST" can legitimately denote Central Standard Time in North America (UTC-6), China Standard Time (UTC+8), or Cuba Standard Time (UTC-5). A single ambiguous abbreviation can derail critical client pitches or executive releases.',
            'Professional global organizations rely exclusively on the canonical IANA (Olson) Time Zone Database, using unambiguous location pairs such as `America/Chicago`, `Asia/Seoul`, or `Europe/London`. IANA identifiers encode full historical rules, future Daylight Saving changes, and geographical jurisdictions.',
          ],
          callout:
            'Never schedule cross-border meetings using 3-letter codes like BST, CST, or IST. Always use standardized IANA canonical names (e.g., Europe/London, Asia/Kolkata).',
        },
        {
          heading: 'Daylight Saving Time (DST) Asymmetry and Jump Gaps',
          paragraphs: [
            'Countries do not switch to Daylight Saving Time on the same date. The United States typically transitions two weeks before European nations in spring and one week later in autumn, while equatorial countries and nations like South Korea and Japan do not observe DST at all.',
            'During these transitional transition weeks, the time difference between New York and London shifts from 5 hours down to 4 hours. Recurring cross-continental meetings suddenly clash with personal schedules unless tracked with DST-aware conversion tools.',
          ],
        },
        {
          heading: 'Identifying the 2-Hour Golden Overlap',
          paragraphs: [
            'Distributed teams thrive when synchronous meetings are strictly confined to a shared 90 to 120-minute window known as the Golden Overlap. For example, a 9:00 AM meeting in London aligns with 6:00 PM in Tokyo and 5:00 PM in Seoul.',
            'Reserving this shared window solely for high-bandwidth alignment, pair programming, or unblocking dependencies protects the remainder of each engineer’s workday for uninterrupted deep work.',
          ],
        },
        {
          heading: 'Asynchronous Handoff Protocols: The 24-Hour Sun Cycle',
          paragraphs: [
            'When real-time overlap is impossible (e.g., San Francisco and Singapore with a 15-hour difference), teams use asynchronous relay handoffs. Evening engineers document open pull requests, reproduction steps, and blockers in concise Loom or markdown digests.',
            'When morning engineers in the opposite hemisphere log in, they pick up the baton with fresh energy, effectively achieving continuous 24-hour development momentum without burning out either team.',
          ],
        },
      ],
      takeaways: [
        'Three-letter time zone acronyms are inherently ambiguous; always verify against IANA canonical IDs.',
        'Spring and autumn Daylight Saving transition mismatches alter global time differences for up to 3 weeks.',
        'Limit real-time meetings to a focused 90-minute Golden Overlap window to protect deep work hours.',
        'Use explicit, shareable permalink URLs when coordinating cross-timezone deadlines.',
      ],
    },

    'neuroscience-of-the-pomodoro-technique': {
      slug: 'neuroscience-of-the-pomodoro-technique',
      title: 'The Neuroscience of the Pomodoro Technique: Sustaining Prefrontal Stamina',
      description:
        'Why breaking complex work into 25-minute intervals prevents prefrontal cortex fatigue, manages dopamine depleting cycles, and defeats procrastination via the 2-minute threshold.',
      category: 'Cognitive Science',
      publishedDate: '2026-09-23',
      readTimeMinutes: 7,
      relatedTool: 'timer',
      heroLead:
        'The Pomodoro Technique is not merely a cute tomato kitchen timer ritual. It is a precise behavioral framework engineered around the biological constraints of human working memory, glucose consumption in the prefrontal cortex, and dopamine reward circuitry.',
      sections: [
        {
          heading: 'Prefrontal Cortex Depletion and Executive Fatigue',
          paragraphs: [
            'The prefrontal cortex (PFC) is the seat of executive cognitive function: logical deduction, impulse control, working memory, and sustained attention. Unlike sensory processing areas of the brain, the PFC operates on high metabolic glucose expenditure and tires rapidly.',
            'When attempting continuous 4-hour uninterrupted work sessions, micro-distractions, attention residue from open browser tabs, and willpower depletion degrade problem-solving clarity, leading to cognitive burnout and diminishing marginal returns.',
          ],
          callout:
            'Cognitive studies reveal that working memory degrades after 30–45 minutes of intense focus. A 5-minute cognitive rest restores glycogen stores and resets attention circuits.',
        },
        {
          heading: 'Ultradian Rhythms and the 25/5 Work-Rest Wave',
          paragraphs: [
            'Pioneering sleep researcher Nathaniel Kleitman discovered that human alertness follows Basic Rest-Activity Cycles (BRAC) during waking hours, oscillating in 90 to 120-minute ultradian rhythms. Within these larger waves, 25-minute sprints represent optimal sub-peaks of acute selective focus.',
            'The mandatory 5-minute break is not wasted time; it is when neuroplastic consolidation occurs. Stepping away from the screen allows the default mode network (DMN) to process synthesized information in the background, frequently generating the breakthrough solutions that elude active strain.',
          ],
        },
        {
          heading: 'Dopaminergic Momentum and the 2-Minute Overcome Threshold',
          paragraphs: [
            'Procrastination is rarely a flaw in time management; it is an emotional regulation defense mechanism against perceived discomfort or cognitive overwhelm. The amygdala perceives a massive 20-page report as a threat, triggering avoidant behavior like scrolling social media.',
            'By committing to a timer set for only 2 or 5 minutes, you lower the neurological barrier to entry below the amygdala’s activation threshold. Once task initiation occurs, the striatum releases baseline dopamine, establishing momentum that effortlessly carries you through the full 25-minute sprint.',
          ],
        },
        {
          heading: 'Protecting the Sprint: Zero Multitasking Hygiene',
          paragraphs: [
            'Multitasking is a biological myth. What feels like parallel processing is actually rapid cognitive task-switching, with each context switch shedding significant attention residue. A single notification ping can hijack focus for up to 23 minutes.',
            'Clock Garden’s timer features ambient fullscreen mode, tab-title live countdowns, and completion audio chimes designed to keep you centered inside a single task without intrusive visual clutter.',
          ],
        },
      ],
      takeaways: [
        'Executive focus in the prefrontal cortex depletes metabolic energy and requires planned micro-rests.',
        '5-minute rests activate the default mode network, facilitating subconscious insight and memory consolidation.',
        'Lowering initiation friction with a short 2-minute timer defeats amygdala-driven task avoidance.',
        'Context switching incurs heavy attention residue; single-task sprints maximize cognitive throughput.',
      ],
    },

    'leap-seconds-and-atomic-time': {
      slug: 'leap-seconds-and-atomic-time',
      title: 'How Digital Civilization Measures One Second: Atomic Clocks, UTC, and Leap Smearing',
      description:
        'Explore the fascinating tension between astronomical solar time and cesium-133 atomic time, why Earth’s wobbling rotation creates leap seconds, and how Google leap smearing keeps the cloud in sync.',
      category: 'Timekeeping Standards',
      publishedDate: '2026-09-24',
      readTimeMinutes: 8,
      relatedTool: 'clock',
      heroLead:
        'We assume that time flows steadily at exactly 86,400 seconds per day. In reality, Earth is an imperfect, wobbling flywheel whose rotation constantly fluctuates, creating a quiet conflict between astronomical time and ultra-precise cesium atomic clocks.',
      sections: [
        {
          heading: 'Defining the Second: From Solar Noon to Cesium-133',
          paragraphs: [
            'Historically, one second was defined as 1/86,400 of a mean solar day. However, tidal friction caused by moon gravity, tectonic plate shifts, and atmospheric wind patterns cause Earth’s rotational velocity to fluctuate unpredictably.',
            'In 1967, the 13th General Conference on Weights and Measures redefined the SI second using quantum physical constants: exactly 9,192,631,770 periods of radiation corresponding to the transition between two hyperfine ground levels of the Cesium-133 atom. International Atomic Time (TAI) was born.',
          ],
          callout:
            'A cesium fountain atomic clock drifts by less than one single second every 300 million years, exposing the irregular wobble of Earth’s physical rotation.',
        },
        {
          heading: 'The Invention of Coordinated Universal Time (UTC) and Leap Seconds',
          paragraphs: [
            'While atomic clocks are impeccably precise, human life is bound to the sun. If civilization ran purely on TAI, solar noon would gradually drift away from 12:00:00 over the centuries.',
            'To maintain harmony between atomic time and Earth’s true orientation (UT1), Coordinated Universal Time (UTC) was established in 1972. Whenever UT1 and UTC diverge by more than 0.9 seconds, the International Earth Rotation and Reference Systems Service (IERS) schedules a leap second: inserting a 61st second (23:59:60) into the day.',
          ],
        },
        {
          heading: 'The Cloud Crisis: Why 23:59:60 Crashes Servers',
          paragraphs: [
            'In computing, POSIX standards assume every day contains exactly 86,400 seconds. When a leap second occurs, many servers freeze or experience kernel panics because system timers encounter duplicate timestamps or invalid seconds values like `:60`.',
            'In 2012, a leap second brought down major platforms across the internet, corrupting databases and causing high-frequency trading disruptions. This spurred cloud engineers to pioneer "leap smearing"—gradually slowing or accelerating server clock frequencies by tiny fractions over a 24-hour window rather than making an instantaneous 1-second leap.',
          ],
        },
        {
          heading: 'The Future: Phasing Out Leap Seconds by 2035',
          paragraphs: [
            'At the 2022 General Conference on Weights and Measures (CGPM), international delegates voted to relax the tolerance between UTC and UT1, effectively pausing leap seconds by 2035 for at least a century.',
            'As global digital infrastructure—from satellite GPS navigation to distributed database consensus algorithms—relies ever more heavily on unbroken monotonic time streams, human timekeeping is officially transitioning from an astronomical anchor to a pure quantum physical foundation.',
          ],
        },
      ],
      takeaways: [
        'The second is officially defined by 9,192,631,770 hyperfine transitions of the cesium-133 atom.',
        'Earth’s physical rotation fluctuates due to lunar tidal friction and core mantle dynamics.',
        'Leap seconds maintain alignment between atomic UTC and astronomical solar noon (UT1).',
        'Leap smearing prevents server crashes by distributing the 1-second adjustment across 24 hours.',
      ],
    },

    'behind-living-clock-crafting-digital-zen': {
      slug: 'behind-living-clock-crafting-digital-zen',
      title: 'Behind Living Clock: Bringing Atmospheric 3D Craft and Procedural Shaders to the Web',
      description:
        'A behind-the-scenes look into how Clock Garden pairs high-precision timekeeping with handcrafted Blender models, canvas shaders, and ambient procedural landscapes.',
      category: 'Art & Design',
      publishedDate: '2026-09-25',
      readTimeMinutes: 7,
      relatedTool: 'clock',
      heroLead:
        'Most online clocks are sterile digital digits surrounded by noisy banner ads. Living Clock reimagines time as a mindful, atmospheric desktop companion by pairing lightweight Blender 3D geometry with real-time procedural canvas lighting.',
      sections: [
        {
          heading: 'The Philosophy of Ambient Computing',
          paragraphs: [
            'Mark Weiser, Xerox PARC chief scientist, coined the concept of "ambient computing"—technology that informs from the periphery of our attention rather than aggressively demanding our center of focus. When you glance out of a window, you effortlessly sense the time of day without reading numbers.',
            'Living Clock applies this principle to the digital desktop. By simulating natural diurnal cycles—the soft rose gold of dawn, the clean amber of afternoon, and the serene deep indigo of twilight—your screen reflects the natural flow of your day in the background.',
          ],
          callout:
            'Digital instruments should serve as calm, aesthetic sanctuaries on your desk, celebrating human craftsmanship rather than maximizing addictive engagement metrics.',
        },
        {
          heading: 'From Blender 3D Viewport to Lightweight Browser Canvas',
          paragraphs: [
            'Each Living Clock scene begins as a handcrafted 3D architectural or natural study in Blender. Rather than downloading bloated 50-megabyte WebGL bundles that spin laptop fans, we render multi-layered atmospheric passes into compressed WebP assets and procedural canvas vector shaders.',
            'In scenes like *Moonlit Conservatory*, glass reflections, water ripple caustics, and botanical silhouettes are rendered using hardware-accelerated 2D canvas drawing calls. This guarantees silky 60fps rendering while maintaining a featherlight network payload under 30KB.',
          ],
        },
        {
          heading: 'Procedural Time Mapping: Rain, Moon Phases, and Lanterns',
          paragraphs: [
            'Living Clock scenes do not play static repeating video loops. In *Lantern Isle*, 60 harbor lanterns progressively light up as the minute hand advances, while a miniature ferry completes an unhurried harbor circuit precisely every 60 seconds.',
            'In *Rainlight*, procedural raindrops streak across the glass with randomized droplet physics calculated on the GPU, while the exterior sky luminance dynamically computes the angle of the sun based on your local system clock.',
          ],
        },
        {
          heading: 'Rejecting Disposable AI Slop for Lasting Craft',
          paragraphs: [
            'The modern web has been flooded with disposable, AI-generated utility clones that offer zero original thought or tactile delight. Clock Garden is built on an enduring commitment to craft: hand-written code, respectful client-side privacy, and original digital art.',
            'Whether keeping screen awake during deep study or resting peacefully on an auxiliary vertical monitor, Living Clock turns your computer display into a living, tranquil window to the present moment.',
          ],
        },
      ],
      takeaways: [
        'Ambient computing informs human awareness from the visual periphery without cognitive distraction.',
        'Multi-layer procedural canvas shaders provide 60fps atmospheric motion at under 30KB network payload.',
        'Diurnal sky cycles and dynamic lighting reflect local time naturally without demanding reading attention.',
        'Handcrafted original art and clean zero-tracking code provide lasting value against disposable web slop.',
      ],
    },
  },

  ko: {
    'circadian-rhythms-and-screen-light': {
      slug: 'circadian-rhythms-and-screen-light',
      title: '생체 시계와 화면 블루라이트의 과학: 야간 디스플레이가 수면 구조를 바꾸는 원리',
      description:
        '망막 신경절 세포(ipRGC)의 신경생물학, 멜라토닌 분비 억제 곡선, 그리고 모니터 앰비언트 모드가 일주기 생체 리듬을 보호하는 과학적 원리를 살펴봅니다.',
      category: '생체 시간학 및 건강',
      publishedDate: '2026-09-20',
      readTimeMinutes: 7,
      relatedTool: 'clock',
      heroLead:
        '인간의 생체 리듬은 자연의 빛 주기에 맞춰 진화했습니다. 해가 진 뒤 컴퓨터 모니터의 강한 협대역 블루라이트에 노출되면 뇌 속 중추 시계는 밤을 한낮으로 착각하여 깊은 렘(REM) 수면과 신체 회복 주기를 무너뜨립니다.',
      sections: [
        {
          heading: '시교차상핵(SCN)과 멜라토닌 분비 억제 메커니즘',
          paragraphs: [
            '시상하부 깊숙이 위치한 시교차상핵(SCN)은 약 2만 개의 신경세포로 구성된 인체의 마스터 시계입니다. 체온 조절, 코르티솔 분비, 세포 대사 회복 등 인체의 24시간 생체 주기를 총괄합니다.',
            '빛 자극은 눈의 내인성 광민감성 망막 신경절 세포(ipRGC)를 통해 SCN으로 전달됩니다. 이 세포는 멜라놉신(melanopsin)이라는 광색소를 함유하고 있으며, LED 모니터의 주 방출 대역인 460~480nm 협대역 청색광에 가장 민감하게 반응합니다.',
          ],
          callout:
            '취침 전 2시간 동안 480nm 블루라이트에 노출되면 자연스러운 멜라토닌 분비가 최대 90분까지 지연되어 렘(REM) 수면 구조가 심각하게 파편화됩니다.',
        },
        {
          heading: '디지털 안정 피로와 20-20-20 안구 보호 규칙',
          paragraphs: [
            '장시간 모니터를 집중해서 바라보면 디지털 눈 피로증(asthenopia)이 발생합니다. 발광 화면을 응시할 때 인간의 눈 깜빡임 횟수는 분당 15~18회에서 5회 미만으로 급감하며, 각막의 눈물막이 증발하여 안구 건조와 피로가 가속화됩니다.',
            '검안의들은 20-20-20 인체공학적 규칙을 권장합니다. 20분 작업할 때마다 최소 20피트(약 6미터) 떨어진 먼 곳을 20초 동안 응시하여 수정체 모양체근의 긴장을 완전히 이완시키는 습관입니다.',
          ],
        },
        {
          heading: 'OLED 다크 모드, 저대비 앰비언트 디스플레이와 데스크 클록',
          paragraphs: [
            '기존의 일반 시계 웹사이트나 위젯들은 눈부신 순백색 배경과 강한 대비로 야간 작업 시 뇌에 불필요한 각성 신호를 보냅니다.',
            'Clock Garden은 OLED 다크 모드와 차분한 앰비언트 씬을 기본 설계로 채택했습니다. 자극적인 백색 픽셀 대신 깊은 흑색(#10110f)과 편안한 앰버/세이지 그린 톤을 사용하여 광자 방출량을 80% 이상 줄였습니다.',
          ],
        },
        {
          heading: '건강한 야간 서재 환경을 위한 인체공학적 조언',
          paragraphs: [
            '야간의 업무 효율과 생체 리듬을 동시에 지키려면 모니터뿐 아니라 주변 조명의 색온도를 2700K 이하의 따뜻한 톤으로 낮추어야 합니다.',
            '보조 모니터에 자극적인 웹 위젯 대신 Clock Garden의 전체화면 앰비언트 시계를 띄워두면, 눈의 피로와 각성 호르몬 자극 없이도 평온하게 시간의 흐름을 인지할 수 있습니다.',
          ],
        },
      ],
      takeaways: [
        '망막의 ipRGC 수용체는 일반 모니터가 방출하는 460~480nm 파장의 청색광에 극도로 민감합니다.',
        '야간 화면 노출은 송과선의 멜라토닌 분비를 억제하여 3단계 서파 수면과 REM 수면을 방해합니다.',
        'OLED 다크 테마와 앰비언트 디스플레이는 야간 망막의 광자 스트레스를 크게 낮춥니다.',
        '20-20-20 규칙을 실천하여 눈물막 증발을 막고 안구 모양체근의 피로를 풀어주세요.',
      ],
    },

    'browser-timer-drift-and-monotonic-clocks': {
      slug: 'browser-timer-drift-and-monotonic-clocks',
      title: '웹 브라우저 타이머가 느려지는 이유: `setInterval` 한계와 단조 시계의 원리',
      description:
        'setInterval이 누적 오차를 유발하는 기술적 원인, 운영체제의 백그라운드 탭 절전 스로틀링, 그리고 하드웨어 단조 시계가 밀리초 단위 정밀도를 보장하는 방식을 깊이 있게 살펴봅니다.',
      category: '소프트웨어 엔지니어링',
      publishedDate: '2026-09-21',
      readTimeMinutes: 8,
      relatedTool: 'stopwatch',
      heroLead:
        '웹 브라우저의 일반적인 타이머나 스톱워치는 다른 탭으로 전환하거나 창을 최소화하면 몇 초씩 오차가 발생합니다. 운영체제의 CPU 스로틀링과 자바스크립트 이벤트 루프, 그리고 단조 시계의 차이를 이해해야 진정한 정밀 계측 도구를 만들 수 있습니다.',
      sections: [
        {
          heading: '단순 재귀적 setInterval 방식의 치명적 결함',
          paragraphs: [
            '많은 초급 웹 위젯들은 1000ms마다 `setInterval`을 호출하여 변수를 1씩 더하는 방식으로 초를 측정합니다. 이는 단일 스레드로 동작하는 자바스크립트의 이벤트 루프 환경에서 필연적으로 오차를 축적합니다.',
            '메인 스레드가 DOM 렌더링, 스타일 연산, 가비지 컬렉션 등으로 바빠지면 타이머 콜백은 매크로태스크 큐(Macrotask Queue)에서 지연됩니다. 이렇게 누적된 지연 시간은 절대 보정되지 않으며, 시간이 흐를수록 실제 시간보다 계속 뒤처지게 됩니다.',
          ],
          callout:
            'CPU 부하가 큰 상황에서 단순 setInterval 카운터를 30분간 방치하면 실제 시간과 1.2초에서 3.5초까지 오차가 벌어질 수 있습니다.',
        },
        {
          heading: '모던 브라우저의 공격적인 백그라운드 탭 스로틀링',
          paragraphs: [
            '배터리 수명을 절약하고 팬 소음을 줄이기 위해 크롬, 사파리, 엣지 등 현대 브라우저는 비활성화된 백그라운드 탭의 타이머 주기를 강제로 1초(1,000ms) 이상, 심한 경우 분당 1회 수준으로 제한합니다.',
            '단순히 틱(Tick)을 세는 방식의 스톱워치나 타이머는 탭을 전환하거나 다른 창 아래에 두는 순간 즉각 멈추거나 심각하게 느려지는 원인이 여기에 있습니다.',
          ],
        },
        {
          heading: '하드웨어 단조 시계(Monotonic Clock)와 performance.now()',
          paragraphs: [
            '`Date.now()`로 얻는 시스템 시각은 1970년 1월 1일(Unix Epoch)을 기준으로 하는 벽시계 시간(Wall-clock time)입니다. 하지만 벽시계 시간은 네트워크 시간 프로토콜(NTP) 동기화나 서머타임 변경에 따라 앞뒤로 순간 이동할 수 있어 비단조적(Non-monotonic)입니다.',
            '고정밀 시간 측정을 위해 브라우저는 High Resolution Time API인 `performance.now()`를 제공합니다. 이는 CPU의 하드웨어 타이머(예: x86 RDTSC 레지스터)를 기반으로 하여 운영체제 시간 변경에 영향을 받지 않고 오직 앞으로만 흐르는 엄격한 단조 시계입니다.',
          ],
        },
        {
          heading: 'Clock Garden의 드리프트 제로 아키텍처',
          paragraphs: [
            'Clock Garden의 타이머와 스톱워치는 단순 반복 틱을 세지 않습니다. 측정이 시작될 때 기준 타임스탬프와 `performance.now()` 마커를 `sessionStorage`에 안전하게 기록합니다.',
            '매 렌더링 프레임 및 탭 복귀 이벤트마다 `현재시각 - 시작시각`의 절대 차이를 역산하므로, 백그라운드에서 몇 시간을 방치하거나 브라우저를 새로고침하더라도 0.001초의 오차 없이 정확한 경과 시간을 즉시 복원합니다.',
          ],
        },
      ],
      takeaways: [
        '자바스크립트의 setInterval은 이벤트 루프 지연으로 인해 시간이 누적 지연되는 근본적 결함이 있습니다.',
        '브라우저는 전력 절약을 위해 백그라운드 탭의 타이머 주기를 1초 이상으로 강제 스로틀링합니다.',
        'Date.now()는 NTP 동기화 시 시간이 뒤로 튈 수 있으므로 정밀 계측에는 performance.now()를 써야 합니다.',
        '절대 목표 시각을 저장하고 현재 시각과의 델타(Delta)를 역산하는 구조가 정확도의 핵심입니다.',
      ],
    },

    'remote-teams-timezone-overlap': {
      slug: 'remote-teams-timezone-overlap',
      title: '글로벌 분산 팀의 시차 극복법: 12개 시간대를 연결하는 골든 오버랩 협업 전략',
      description:
        '모호한 3자리 시차 약어의 위험성, 국가별 서머타임 전환 불일치, 그리고 글로벌 분산 조직이 2시간의 골든 오버랩을 활용해 24시간 연속 개발 사이클을 완성하는 방법을 분석합니다.',
      category: '생산성 및 원격 근무',
      publishedDate: '2026-09-22',
      readTimeMinutes: 6,
      relatedTool: 'world-clock',
      heroLead:
        '샌프란시스코, 런던, 서울, 시드니에 팀원이 흩어져 있다면 전통적인 9-to-5 동기식 협업은 불가능합니다. 명확한 IANA 표준 시간대 앵커와 비동기 인수인계 프로토콜을 구축하면 시차는 장애물이 아닌 24시간 릴레이 개발의 강력한 무기가 됩니다.',
      sections: [
        {
          heading: '모호한 3자리 시간대 약어의 함정',
          paragraphs: [
            '일정 조율 시 흔히 사용하는 "10:00 AM CST"라는 표기는 치명적인 실수를 낳습니다. CST는 미국 중부 표준시(UTC-6), 중국 표준시(UTC+8), 쿠바 표준시(UTC-5) 등 세 개 대륙의 전혀 다른 시간대를 모두 가리킬 수 있기 때문입니다.',
            '글로벌 기업들은 3자리 약어 대신 IANA(Olson) 표준 데이터베이스 이름인 `America/Chicago`, `Asia/Seoul`, `Europe/London`을 의무적으로 사용합니다. 이 식별자에는 해당 지역의 수십 년간의 서머타임 규칙과 행정구역 변경 이력이 온전히 담겨 있습니다.',
          ],
          callout:
            'BST, CST, IST와 같은 3자리 시차 약어는 국가마다 중복됩니다. 항상 표준 IANA 식별자(예: Europe/London, Asia/Seoul)를 사용하여 약속을 잡으세요.',
        },
        {
          heading: '서머타임(DST) 시작·종료 시점의 비대칭 시차 간극',
          paragraphs: [
            '세계 각국은 서머타임을 같은 날에 바꾸지 않습니다. 미국은 대개 유럽보다 봄에 2주 일찍 서머타임을 시작하고 가을에 1주 늦게 종료하며, 한국과 일본처럼 서머타임을 전혀 적용하지 않는 국가도 많습니다.',
            '이로 인해 런던과 뉴욕의 시차는 평소 5시간이다가 특정 주간에는 4시간으로 줄어듭니다. 시차 변환기를 통해 이러한 변칙 구간을 사전에 점검하지 않으면 글로벌 정기 회의가 어긋나기 십상입니다.',
          ],
        },
        {
          heading: '집중적 동기 소통을 위한 2시간의 골든 오버랩(Golden Overlap)',
          paragraphs: [
            '시차가 큰 팀이 모두에게 무리 없는 협업을 하려면 실시간 회의를 하루 90~120분의 "골든 오버랩" 시간대로 엄격히 제한해야 합니다. 예를 들어 런던의 오전 9시는 도쿄의 오후 6시, 서울의 오후 5시와 겹칩니다.',
            '이 귀중한 겹침 시간에는 블로커 해결과 의사결정 회의만 진행하고, 나머지 근무 시간은 방해받지 않는 온전한 딥 워크(Deep Work) 시간으로 보장해야 팀의 피로도를 낮출 수 있습니다.',
          ],
        },
        {
          heading: '24시간 릴레이 바통 터치를 위한 비동기 핸드오프 규칙',
          paragraphs: [
            '샌프란시스코와 싱가포르처럼 시차가 15시간에 달해 오버랩이 불가능한 경우 비동기 인수인계(Asynchronous Handoff)가 정답입니다. 퇴근하는 엔지니어는 오늘의 진행 상황, PR 요약, 재현 링크를 깔끔한 마크다운 리포트로 남깁니다.',
            '지구 반대편의 동료가 출근하여 그 바통을 이어받아 코드를 리뷰하고 빌드함으로써, 24시간 쉬지 않고 제품이 전진하는 진정한 글로벌 개발 모멘텀이 완성됩니다.',
          ],
        },
      ],
      takeaways: [
        '3자리 시간대 약어는 혼란을 유발하므로 항상 IANA 표준 지역 식별자를 사용하세요.',
        '봄과 가을의 국가별 서머타임 시작일 불일치는 시차를 일시적으로 왜곡시킵니다.',
        '실시간 회의는 90~120분의 골든 오버랩으로 압축하고, 나머지는 딥 워크로 보호하세요.',
        '시차를 넘어선 협업 시에는 세팅 값이 고정된 공유 링크(URL)를 적극 활용하세요.',
      ],
    },

    'neuroscience-of-the-pomodoro-technique': {
      slug: 'neuroscience-of-the-pomodoro-technique',
      title: '포모도로 기법 25분의 뇌과학: 전두엽 피로를 막고 몰입을 유지하는 메커니즘',
      description:
        '복잡한 과업을 25분 단위로 쪼개는 것이 어떻게 전두엽 글리코겐 고갈을 막고, 도파민 보상 회로를 자극하며, 2분 실행 규칙을 통해 미루는 습관을 극복하는지 살펴봅니다.',
      category: '인지 뇌과학 및 생산성',
      publishedDate: '2026-09-23',
      readTimeMinutes: 7,
      relatedTool: 'timer',
      heroLead:
        '포모도로 기법은 단순한 토마토 타이머 놀이가 아닙니다. 인간 작업 기억(Working Memory)의 용량 한계, 전두엽의 포도당 소모율, 그리고 도파민 보상 시스템의 특성을 정밀하게 조율한 뇌과학적 행동 설계입니다.',
      sections: [
        {
          heading: '전두엽 피질(Prefrontal Cortex)의 대사적 고갈',
          paragraphs: [
            '전두엽 피질은 논리적 추론, 충동 억제, 집중력 유지 등 실행 기능을 관장하는 뇌의 사령탑입니다. 다른 뇌 부위와 달리 전두엽은 고농도의 포도당과 글리코겐을 소모하며 급격한 피로를 느낍니다.',
            '휴식 없이 4시간 연속으로 작업을 강행하면 작업 기억 용량이 급격히 줄어들고, 브라우저 탭을 오갈 때마다 발생하는 주의 잔류물(Attention Residue)로 인해 문제 해결 속도가 곤두박질치게 됩니다.',
          ],
          callout:
            '인지 뇌과학 연구에 따르면 30~45분 이상 고강도 집중이 지속되면 뇌의 작업 기억 효율이 저하됩니다. 5분의 휴식은 주의력 신경망을 리셋하는 필수 연료 충전 시간입니다.',
        },
        {
          heading: '울트라디안 리듬과 25분 집중 / 5분 휴식의 파동',
          paragraphs: [
            '수면 생리학자 나다니엘 클라이트만은 인간의 각성 주기가 낮 동안에도 90~120분 단위의 기본 휴식-활동 주기(BRAC, 울트라디안 리듬)를 따른다는 사실을 발견했습니다. 25분 집중 스프린트는 이 거대한 파동 속에서 뇌가 가장 선명하게 집중할 수 있는 이상적인 미세 정점입니다.',
            '의무적인 5분의 휴식 시간 동안 모니터에서 눈을 떼면, 뇌의 디폴트 모드 네트워크(DMN)가 활성화되어 방금 학습한 정보를 무의식 속에서 재구성하고 통합하여 번뜩이는 통찰을 만들어냅니다.',
          ],
        },
        {
          heading: '도파민 모멘텀과 편도체 저항을 넘는 2분 실행 규칙',
          paragraphs: [
            '일을 미루는 행위는 시간 관리 능력이 부족해서가 아니라, 과업의 막막함에서 오는 불안을 회피하려는 편도체(Amygdala)의 감정 방어 기제입니다. 수십 장의 기획서라는 부담은 뇌에 위험 신호로 인식됩니다.',
            '이때 타이머를 딱 2분이나 5분으로 맞추고 "이 시간만 시작해 본다"고 목표를 낮추면 편도체의 경보 시스템을 무력화할 수 있습니다. 행동이 시작되는 순간 뇌의 선조체에서 도파민이 분비되며 작업 모멘텀이 형성되어 자연스럽게 25분 완주로 이어집니다.',
          ],
        },
        {
          heading: '스프린트의 순도 지키기: 멀티태스킹의 허상과 알림 차단',
          paragraphs: [
            '인간의 뇌는 동시에 여러 과업을 처리할 수 없습니다. 우리가 멀티태스킹이라고 느끼는 것은 단지 두 작업 사이를 빠르게 스위칭하며 엄청난 에너지를 낭비하는 것에 불과합니다. 메신저 알림 하나에 뺏긴 집중을 되찾는 데는 최대 23분이 걸립니다.',
            'Clock Garden의 타이머는 탭 제목 카운트다운, 앰비언트 전체화면 모드, 완료 알림 차임을 제공하여 시각적 산만함 없이 오직 하나의 과업에만 몰입할 수 있도록 돕습니다.',
          ],
        },
      ],
      takeaways: [
        '전두엽 피질의 집중력은 한정된 대사 자원을 소비하므로 정기적인 짧은 휴식이 필수적입니다.',
        '5분 휴식 시 활성화되는 디폴트 모드 네트워크(DMN)가 아이디어 정리와 창의적 발상을 돕습니다.',
        '막막한 과업은 2분 타이머로 시작 장벽을 낮춰 편도체의 회피 반응을 우회하세요.',
        '작업 전환 시 주의 잔류물이 발생하므로 25분 동안은 단 하나의 목표에만 전념해야 합니다.',
      ],
    },

    'leap-seconds-and-atomic-time': {
      slug: 'leap-seconds-and-atomic-time',
      title: '디지털 문명이 1초를 정의하는 방법: 원자시계, UTC, 그리고 윤초의 기술적 비밀',
      description:
        '천문학적 태양시와 세슘-133 원자시의 미세한 간극, 지구 자전의 불규칙성이 만들어낸 윤초(Leap Second), 그리고 클라우드 장애를 막기 위한 구글의 윤초 스미어링(Leap Smearing) 기술을 알아봅니다.',
      category: '시간 계측 표준',
      publishedDate: '2026-09-24',
      readTimeMinutes: 8,
      relatedTool: 'clock',
      heroLead:
        '우리는 하루가 항상 정확히 86,400초라고 믿습니다. 하지만 지구는 조석 마찰과 맨틀 운동으로 속도가 불규칙하게 흔들리는 플라이휠이며, 이로 인해 천문시와 원자시계 사이에는 미세한 시차가 발생합니다.',
      sections: [
        {
          heading: '1초의 정의: 태양 남중시에서 세슘-133 원자시계로',
          paragraphs: [
            '과거 인류는 태양이 정남쪽에 오는 남중 시간을 기준으로 하루의 1/86,400을 1초로 정의했습니다. 그러나 달의 조석력으로 인한 마찰과 지각 변동으로 인해 지구의 자전 속도는 해마다 미세하게 느려집니다.',
            '1967년 국제도량형총회는 1초를 불변의 물리량으로 재정의했습니다. 세슘-133 원자가 기저 상태의 두 초미세 에너지 준위 사이를 전이할 때 방출하는 전자기파의 주기가 정확히 91억 9263만 1770번 진동하는 시간을 1초로 확정한 것입니다.',
          ],
          callout:
            '세슘 분수 원자시계는 3억 년에 1초 이하의 오차를 자랑하며, 지구라는 행성이 가진 자전의 흔들림을 적나라하게 보여줍니다.',
        },
        {
          heading: '협정 세계시(UTC)의 탄생과 윤초(Leap Second)의 도입',
          paragraphs: [
            '원자시계는 너무나 정확하지만 인간의 일상은 태양의 높낮이에 종속되어 있습니다. 원자시계만을 고집한다면 수백 년 후에는 낮 12시에 해가 뜨지 않는 역전 현상이 생길 수 있습니다.',
            '이를 절충하기 위해 1972년 협정 세계시(UTC)가 도입되었습니다. 원자시(TAI)를 따르되, 지구 자전 기반의 천문시(UT1)와의 차이가 0.9초를 넘지 않도록 국제지구자전국(IERS)의 결정에 따라 1초를 더하는 윤초(23:59:60)를 삽입하게 되었습니다.',
          ],
        },
        {
          heading: '23:59:60의 공포: 컴퓨터 서버와 클라우드가 멈추는 이유',
          paragraphs: [
            '컴퓨터의 POSIX 표준 시계는 하루가 언제나 86,400초라고 가정합니다. 시스템 시계에 존재하지 않는 초인 `:60`이 들어오거나 같은 시각이 두 번 반복되면 서버 커널이 패닉에 빠지거나 데이터베이스 정렬이 깨집니다.',
            '실제로 2012년 윤초 적용 당시 전 세계 유명 사이트들이 동시다발적으로 다운되었습니다. 이를 해결하기 위해 구글 등은 윤초 당일 24시간 동안 시계를 1초당 수 마이크로초씩 미세하게 늦추는 "윤초 스미어링(Leap Smearing)" 기법을 고안해 냈습니다.',
          ],
        },
        {
          heading: '역사의 뒤안길로: 2035년 윤초 폐지 결정',
          paragraphs: [
            '2022년 국제도량형총회는 2035년까지 윤초 삽입을 잠정 중단하기로 결의했습니다. 인공위성 GPS, 고빈도 금융 거래, 분산 클라우드 시스템 등 현대 디지털 인프라에 윤초가 주는 위험이 너무 크기 때문입니다.',
            '인류의 시간은 이제 천문학적 관측이라는 자연의 밧줄을 풀고, 우주 보편의 양자역학적 물리 법칙 위에 영구히 닻을 내리게 되었습니다.',
          ],
        },
      ],
      takeaways: [
        '현대 1초의 정의는 세슘-133 원자의 9,192,631,770회 고유 진동 주기를 기반으로 합니다.',
        '지구 자전 속도는 조석 마찰과 지구 내부 운동으로 인해 일정하지 않고 변동합니다.',
        '윤초는 원자시계 기반의 UTC와 태양 위치 기반의 UT1 간 오차를 보정하기 위한 장치였습니다.',
        '현대 디지털 서버는 23:59:60 충돌을 막기 위해 24시간에 걸쳐 1초를 분산시키는 스미어링을 씁니다.',
      ],
    },

    'behind-living-clock-crafting-digital-zen': {
      slug: 'behind-living-clock-crafting-digital-zen',
      title: '리빙 클록 제작기: Blender 3D 모델링과 절차적 캔버스 셰이더로 빚어낸 시간의 공간',
      description:
        'Clock Garden이 무미건조한 숫자 대신 Blender 3D 지오메트리, 절차적 캔버스 셰이더, 그리고 일주기 조명 알고리즘을 결합하여 살아 숨쉬는 디지털 시간의 안식처를 제작한 과정을 공개합니다.',
      category: '아트 및 인터랙티브 디자인',
      publishedDate: '2026-09-25',
      readTimeMinutes: 7,
      relatedTool: 'clock',
      heroLead:
        '인터넷의 수많은 시계들은 깜빡이는 배너 광고와 삭막한 폰트 숫자에 갇혀 있습니다. Living Clock은 가벼운 3D 지오메트리와 2D 캔버스 셰이더를 융합하여, 모니터 위에서 시간의 흐름을 고요히 느낄 수 있는 인터랙티브 안식처로 시계를 재해석했습니다.',
      sections: [
        {
          heading: '앰비언트 컴퓨팅(Ambient Computing)과 시각적 평온',
          paragraphs: [
            '제록스 파크의 전설적인 컴퓨터 과학자 마크 와이저는 기술이 인간의 주의력을 강탈하지 않고 주변부(Periphery)에 자연스럽게 녹아드는 "앰비언트 컴퓨팅"을 제창했습니다. 창밖을 볼 때 숫자를 읽지 않고도 대략의 시각과 계절을 직관하는 것과 같습니다.',
            'Living Clock은 이 철학을 데스크톱 화면에 구현했습니다. 새벽의 은은한 로즈 골드빛, 한낮의 선명한 햇살, 해 질 녘의 보랏빛 노을이 로컬 시계에 맞춰 부드럽게 전환되며 시간의 흐름을 뇌에 직관적으로 전달합니다.',
          ],
          callout:
            '디지털 도구는 사용자의 시선을 억지로 빼앗는 것이 아니라, 책상 위에 머물며 마음을 편안하게 해주는 고요한 배경이 되어야 합니다.',
        },
        {
          heading: 'Blender 3D 뷰포트에서 브라우저 캔버스로의 여정',
          paragraphs: [
            '각 리빙 클록 씬은 Blender에서 시작된 정교한 3D 건축 및 자연 환경 모델링에서 출발합니다. 하지만 수십 메가바이트의 무거운 3D 파일을 브라우저로 내려받게 하면 노트북 팬이 돌고 로딩이 지연됩니다.',
            'Clock Garden은 3D 장면의 빛과 그림자를 고효율 WebP 레이어로 분리하고, 빗방울과 수면의 파문, 별빛 효과를 경량 2D 캔버스 벡터 셰이더로 직접 렌더링했습니다. 그 결과 30KB 미만의 깃털 같은 용량으로 60fps의 매끄러운 움직임을 구현했습니다.',
          ],
        },
        {
          heading: '시간과 동기화되는 절차적 인터랙션: 랜턴, 배, 그리고 비',
          paragraphs: [
            'Living Clock의 장면들은 단순한 비디오 무한 반복 재생이 아닙니다. *Lantern Isle*에서는 분(Minute)이 바뀔 때마다 해안가의 60개 가로등에 하나씩 불이 켜지며, 작은 연락선이 60초마다 만을 한 바퀴 우아하게 순회합니다.',
            '비 내리는 창가를 묘사한 *Rainlight* 씬에서는 GPU 캔버스 알고리즘이 빗방울의 흐름과 표면 장력을 실시간 연산하며, 현재 시간에 맞추어 창밖의 하늘빛을 실시간으로 물들입니다.',
          ],
        },
        {
          heading: '인스턴트 AI 복제물이 범람하는 시대에 장인정신을 고집하는 이유',
          paragraphs: [
            '현재 웹에는 클릭 한 번으로 찍어낸 공허한 AI 복제 사이트들이 넘쳐납니다. Clock Garden은 직접 한 줄 한 줄 짠 순수 코드, 100% 클라이언트 사이드 프라이버시, 그리고 수작업 오리지널 아트를 타협 없이 고수합니다.',
            '업무 중 화면 꺼짐 방지(Wake Lock)를 켜두거나 서재의 보조 모니터에 전체화면으로 띄워둘 때, Living Clock은 모니터라는 차가운 유리를 시간을 담는 가장 따뜻한 풍경화로 바꾸어 드립니다.',
          ],
        },
      ],
      takeaways: [
        '앰비언트 컴퓨팅은 사용자의 의식 집중을 방해하지 않고 배경에서 자연스럽게 시각 정보를 전달합니다.',
        '다층 레이어 렌더링과 2D 캔버스 셰이더를 통해 30KB 이하의 초경량으로 60fps 그래픽을 실현했습니다.',
        '시간에 따라 가로등이 켜지고 해가 기울어지는 인터랙티브 디테일이 살아있는 경험을 줍니다.',
        '장인정신으로 빚은 오리지널 아트와 무추적 클라이언트 코드가 진정한 사용자 가치를 만듭니다.',
      ],
    },
  },
};
