import { nextAlarm, isAlarmDue, snoozeAlarm, type Alarm } from '../lib/alarm';
import { track } from '../lib/analytics';
import { unlockAudio, playSound, type SoundName } from '../lib/audio';
import { readStored, writeStored } from '../lib/storage';
import {
  addTimerTime,
  formatClock,
  formatDate,
  formatDuration,
  lapStats,
  localTimeZone,
  pauseStopwatch,
  pauseTimer,
  startTimer,
  stopwatchElapsed,
  timerRemaining,
  utcOffsetLabel,
  type StopwatchState,
  type TimerState,
} from '../lib/time';
import {
  dateKey,
  formatInZone,
  getZonedParts,
  supportedTimeZones,
  timeZoneName,
  possibleInstants,
} from '../lib/timezone';

import { cityNames, resolveZone, displayZone } from '../lib/cities';
import {
  MAX_TIMER_MS,
  validateTimerSession,
  validatePresets,
  type TimerPreset,
} from '../lib/timer-session';

const instrument = document.querySelector<HTMLElement>('[data-tool]');
const locale = instrument?.dataset.locale === 'ko' ? 'ko-KR' : 'en-US';
const ko = locale === 'ko-KR';

function button(action: string): HTMLButtonElement | null {
  return instrument?.querySelector<HTMLButtonElement>(`[data-action="${action}"]`) ?? null;
}

function status(message: string): void {
  const output = instrument?.querySelector<HTMLElement>('[data-status]');
  if (output) output.textContent = message;
}

function sendNotification(title: string, body: string): void {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon.svg' });
    }
  } catch {
    // The visual and audio states still communicate completion.
  }
}

function validZone(value: string, zones: string[]): string | null {
  return resolveZone(value, zones);
}

async function copyLink(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
    status(ko ? '링크를 복사했습니다.' : 'Link copied.');
  } catch {
    status(
      ko
        ? '복사할 수 없습니다. 주소 표시줄의 링크를 복사하세요.'
        : 'Copy unavailable. Copy the link from your address bar.',
    );
  }
}

function downloadText(text: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function toggleFullscreen(): Promise<void> {
  if (!instrument || !document.fullscreenEnabled) return;
  if (document.fullscreenElement) await document.exitFullscreen();
  else {
    await instrument.requestFullscreen();
    track('fullscreen_enter');
  }
}

function configureFullscreen(): void {
  const control = button('fullscreen');
  if (!control) return;
  if (!document.fullscreenEnabled) control.hidden = true;
  else {
    control.addEventListener(
      'click',
      () =>
        void toggleFullscreen().catch(() =>
          status(ko ? '전체 화면을 시작할 수 없습니다.' : 'Fullscreen is unavailable.'),
        ),
    );
    document.addEventListener('fullscreenchange', () => {
      const active = document.fullscreenElement === instrument;
      control.textContent = active
        ? ko
          ? '전체 화면 종료'
          : 'Exit fullscreen'
        : ko
          ? '전체 화면'
          : 'Fullscreen';
      control.setAttribute('aria-label', control.textContent);
    });
  }
}

function initClock(): void {
  if (!instrument) return;
  type Preferences = { seconds: boolean; millis: boolean; hour12: boolean; analog: boolean };
  const validate = (value: unknown): Preferences | null => {
    if (!value || typeof value !== 'object') return null;
    const v = value as Partial<Preferences>;
    return typeof v.seconds === 'boolean' &&
      typeof v.millis === 'boolean' &&
      typeof v.hour12 === 'boolean' &&
      typeof v.analog === 'boolean'
      ? (v as Preferences)
      : null;
  };
  const query = new URLSearchParams(location.search);
  let living: ReturnType<typeof import('./living-clock').createLivingClock> | undefined;
  let livingEnabled =
    query.get('view') === 'living' ||
    (query.get('view') !== 'digital' &&
      readStored('mg-living', (value) => (typeof value === 'boolean' ? value : null), false));
  const livingControl = button('living')!;
  async function setLiving(value: boolean): Promise<void> {
    livingControl.disabled = true;
    try {
      if (value && !living) {
        const module = await import('./living-clock');
        living = module.createLivingClock(instrument!, ko);
      }
      livingEnabled = value;
      living?.setEnabled(value);
      livingControl.textContent = value ? (ko ? '숫자 시계로' : 'Digital clock') : '✦ Living Clock';
      livingControl.setAttribute('aria-pressed', String(value));
      livingControl.classList.toggle('is-active', value);
      writeStored('mg-living', value);
      const url = new URL(location.href);
      url.searchParams.set('view', value ? 'living' : 'digital');
      history.replaceState(null, '', url);
      render();
    } catch {
      livingEnabled = false;
      status(
        ko
          ? '풍경을 불러오지 못했습니다. 숫자 시계는 계속 사용할 수 있습니다.'
          : 'The island could not load. The digital clock is still available.',
      );
    } finally {
      livingControl.disabled = false;
    }
  }
  livingControl.addEventListener('click', () => void setLiving(!livingEnabled));
  let prefs = readStored('mg-clock', validate, {
    seconds: true,
    millis: false,
    hour12: false,
    analog: false,
  });
  if (query.get('format') === '12') prefs.hour12 = true;
  if (query.get('format') === '24') prefs.hour12 = false;
  if (query.get('milliseconds') === '1') prefs.millis = true;
  const zone = localTimeZone();
  const time = instrument.querySelector<HTMLElement>('[data-clock-time]')!;
  const date = instrument.querySelector<HTMLElement>('[data-clock-date]')!;
  const zoneElement = instrument.querySelector<HTMLElement>('[data-clock-zone]')!;
  const offset = instrument.querySelector<HTMLElement>('[data-clock-offset]')!;
  const analogWrap = instrument.querySelector<HTMLElement>('[data-analog-wrap]')!;
  const secondsControl = button('seconds')!;
  const millisControl = button('millis')!;
  const modeControl = button('hour-mode')!;
  const analogControl = button('analog')!;
  let lastPaint = 0;

  const persist = () => writeStored('mg-clock', prefs);
  const setPressed = (control: HTMLButtonElement, pressed: boolean, labels: [string, string]) => {
    control.setAttribute('aria-pressed', String(pressed));
    control.classList.toggle('is-active', pressed);
    control.textContent = labels[pressed ? 1 : 0];
  };
  const syncControls = () => {
    setPressed(
      secondsControl,
      prefs.seconds,
      ko ? ['초 끔', '초 켬'] : ['Seconds off', 'Seconds on'],
    );
    setPressed(
      millisControl,
      prefs.millis,
      ko ? ['밀리초 끔', '밀리초 켬'] : ['Milliseconds off', 'Milliseconds on'],
    );
    setPressed(
      analogControl,
      prefs.analog,
      ko ? ['아날로그', '아날로그 켬'] : ['Analog', 'Analog on'],
    );
    modeControl.textContent = prefs.hour12 ? '12h' : '24h';
    analogWrap.hidden = !prefs.analog;
  };
  function render(timestamp = performance.now()): void {
    if (document.hidden || (!prefs.millis && timestamp - lastPaint < 200)) return;
    if (prefs.millis && timestamp - lastPaint < 30) return;
    lastPaint = timestamp;
    const now = living?.date() ?? new Date();
    const base = formatClock(now, {
      locale,
      hour12: prefs.hour12,
      timeZone: zone,
      seconds: prefs.seconds,
    });
    time.innerHTML = prefs.millis
      ? base.replace(
          /(\d{2})([^\d]*)$/,
          `$1<span class="milliseconds">.${String(now.getMilliseconds()).padStart(3, '0')}</span>$2`,
        )
      : base;
    date.textContent = formatDate(now, locale, zone);
    offset.textContent = utcOffsetLabel(now, zone);
    if (prefs.analog) {
      const parts = getZonedParts(now, zone);
      const second = parts.second + now.getMilliseconds() / 1000;
      const minute = parts.minute + second / 60;
      const hour = (parts.hour % 12) + minute / 60;
      instrument!.querySelector<HTMLElement>('[data-hour-hand]')!.style.transform =
        `rotate(${hour * 30}deg)`;
      instrument!.querySelector<HTMLElement>('[data-minute-hand]')!.style.transform =
        `rotate(${minute * 6}deg)`;
      instrument!.querySelector<HTMLElement>('[data-second-hand]')!.style.transform =
        `rotate(${second * 6}deg)`;
    }
  }
  function loop(timestamp: number): void {
    render(timestamp);
    requestAnimationFrame(loop);
  }
  zoneElement.textContent = zone;
  syncControls();
  render();
  if (livingEnabled) void setLiving(true);
  requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) render();
  });
  secondsControl.addEventListener('click', () => {
    prefs.seconds = !prefs.seconds;
    if (!prefs.seconds) prefs.millis = false;
    syncControls();
    persist();
    render();
  });
  millisControl.addEventListener('click', () => {
    prefs.millis = !prefs.millis;
    if (prefs.millis) prefs.seconds = true;
    syncControls();
    persist();
    render();
  });
  modeControl.addEventListener('click', () => {
    prefs.hour12 = !prefs.hour12;
    syncControls();
    persist();
    render();
  });
  analogControl.addEventListener('click', () => {
    prefs.analog = !prefs.analog;
    syncControls();
    persist();
    render();
  });

  const wakeControl = button('wake');
  const wakeNavigator = navigator as Navigator & {
    wakeLock?: {
      request: (type: 'screen') => Promise<{
        release: () => Promise<void>;
        addEventListener: (type: string, listener: () => void) => void;
      }>;
    };
  };
  let wakeLock: Awaited<ReturnType<NonNullable<typeof wakeNavigator.wakeLock>['request']>> | null =
    null;
  if (wakeControl && wakeNavigator.wakeLock) {
    wakeControl.hidden = false;
    wakeControl.addEventListener('click', async () => {
      try {
        if (wakeLock) {
          await wakeLock.release();
          wakeLock = null;
        } else {
          wakeLock = await wakeNavigator.wakeLock!.request('screen');
          wakeLock.addEventListener('release', () => {
            wakeLock = null;
            wakeControl.setAttribute('aria-pressed', 'false');
          });
        }
        wakeControl.setAttribute('aria-pressed', String(Boolean(wakeLock)));
        wakeControl.classList.toggle('is-active', Boolean(wakeLock));
      } catch {
        status(ko ? '화면 켜두기를 사용할 수 없습니다.' : 'Screen wake lock is unavailable.');
      }
    });
  }
}

function initStopwatch(): void {
  if (!instrument) return;
  let state: StopwatchState = { accumulatedMs: 0, startedAt: null };
  let laps: number[] = [];
  let previousLap = 0;
  const display = instrument.querySelector<HTMLElement>('[data-stopwatch-time]')!;
  const start = button('start')!;
  const lap = button('lap')!;
  const reset = button('reset')!;
  const list = instrument.querySelector<HTMLOListElement>('[data-lap-list]')!;
  const stats = instrument.querySelector<HTMLElement>('[data-lap-stats]')!;
  let frame = 0;
  function render(): void {
    cancelAnimationFrame(frame);
    display.textContent = formatDuration(stopwatchElapsed(state, performance.now()));
    if (state.startedAt !== null) frame = requestAnimationFrame(render);
  }
  function sync(): void {
    const running = state.startedAt !== null;
    start.textContent = running
      ? ko
        ? '일시정지'
        : 'Pause'
      : state.accumulatedMs > 0
        ? ko
          ? '계속'
          : 'Resume'
        : ko
          ? '시작'
          : 'Start';
    lap.disabled = !running;
    reset.disabled = running || (state.accumulatedMs === 0 && !laps.length);
  }
  function toggle(): void {
    if (state.startedAt === null) {
      state.startedAt = performance.now();
      track('stopwatch_start');
    } else state = pauseStopwatch(state, performance.now());
    sync();
    render();
  }
  function addLap(): void {
    if (state.startedAt === null) return;
    const total = stopwatchElapsed(state, performance.now());
    button('export-laps')!.disabled = false;
    laps.push(total - previousLap);
    previousLap = total;
    list.innerHTML = laps
      .map(
        (duration, index) =>
          `<li><span>#${index + 1}</span><span>${ko ? '누적' : 'Total'} ${formatDuration(laps.slice(0, index + 1).reduce((a, b) => a + b, 0))}</span><time>${formatDuration(duration)}</time></li>`,
      )
      .reverse()
      .join('');
    const values = lapStats(laps)!;
    stats.hidden = false;
    stats.innerHTML = `<span>${ko ? '최고' : 'Best'} ${formatDuration(values.best)}</span><span>${ko ? '평균' : 'Average'} ${formatDuration(values.average)}</span><span>${ko ? '최저' : 'Slowest'} ${formatDuration(values.slowest)}</span>`;
  }
  function clear(): void {
    state = { accumulatedMs: 0, startedAt: null };
    laps = [];
    button('export-laps')!.disabled = true;
    previousLap = 0;
    list.innerHTML = '';
    stats.hidden = true;
    sync();
    render();
  }
  button('export-laps')!.addEventListener('click', () => {
    let total = 0;
    const rows = laps.map((duration, index) => {
      total += duration;
      return [index + 1, Math.round(duration), Math.round(total)].join(',');
    });
    downloadText(
      ['Lap,Lap milliseconds,Total milliseconds', ...rows].join('\r\n'),
      'clock-garden-laps.csv',
      'text/csv;charset=utf-8',
    );
  });
  start.addEventListener('click', toggle);
  lap.addEventListener('click', addLap);
  reset.addEventListener('click', clear);
  document.addEventListener('keydown', (event) => {
    if (
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.target as HTMLElement).closest(
        'input,button,select,textarea,a,[contenteditable="true"]',
      )
    )
      return;
    if (event.code === 'Space') {
      event.preventDefault();
      toggle();
    } else if (event.key.toLowerCase() === 'l') addLap();
    else if (event.key.toLowerCase() === 'r' && state.startedAt === null) clear();
  });
  sync();
}

function initTimer(): void {
  if (!instrument) return;
  const form = instrument.querySelector<HTMLFormElement>('[data-duration-form]')!;
  const fields = ['hours', 'minutes', 'seconds'].map(
    (name) => form.elements.namedItem(name) as HTMLInputElement,
  );
  const display = instrument.querySelector<HTMLElement>('[data-timer-time]')!;
  const visual = instrument.querySelector<HTMLElement>('[data-timer-visual]')!;
  const repeat = instrument.querySelector<HTMLInputElement>('[data-repeat]')!;
  const start = button('start')!;
  const presetList = instrument.querySelector<HTMLElement>('[data-saved-timers]')!;
  const saveForm = instrument.querySelector<HTMLFormElement>('[data-save-timer]')!;
  const query = new URLSearchParams(location.search);
  const querySeconds = Number(query.get('seconds'));
  let initialMs =
    Number.isInteger(querySeconds) && querySeconds > 0 && querySeconds * 1000 <= MAX_TIMER_MS
      ? querySeconds * 1000
      : 300_000;
  let state: TimerState = { remainingMs: initialMs, targetAt: null };
  let saved: ReturnType<typeof validateTimerSession> = null;
  try {
    saved = validateTimerSession(JSON.parse(sessionStorage.getItem('mg-timer-session') ?? 'null'));
  } catch {
    /* Optional storage. */
  }
  // The same tab survives refresh/navigation; a different explicit duration starts a fresh setup.
  if (saved && (!query.has('seconds') || initialMs === saved.initialMs)) {
    initialMs = saved.initialMs;
    state = saved.state;
    repeat.checked = saved.repeat;
    status(ko ? '이 탭의 타이머를 복원했습니다.' : 'Restored this tab’s countdown.');
  }
  let presets = readStored<TimerPreset[]>('mg-timer-presets', validatePresets, []);
  const title = document.title;
  function persist(): void {
    try {
      sessionStorage.setItem(
        'mg-timer-session',
        JSON.stringify({ initialMs, state, repeat: repeat.checked }),
      );
    } catch {
      /* Works in memory. */
    }
    const url = new URL(location.href);
    url.searchParams.set('seconds', String(initialMs / 1000));
    history.replaceState(null, '', url);
  }
  function setFields(): void {
    const seconds = Math.floor(initialMs / 1000);
    fields[0]!.value = String(Math.floor(seconds / 3600));
    fields[1]!.value = String(Math.floor((seconds % 3600) / 60));
    fields[2]!.value = String(seconds % 60);
  }
  function sync(): void {
    const running = state.targetAt !== null;
    start.textContent = running
      ? ko
        ? '일시정지'
        : 'Pause'
      : state.remainingMs > 0 && state.remainingMs < initialMs
        ? ko
          ? '계속'
          : 'Resume'
        : ko
          ? '시작'
          : 'Start';
    fields.forEach((field) => {
      field.disabled = running;
    });
    instrument!
      .querySelectorAll<HTMLButtonElement>('[data-preset], [data-load-preset]')
      .forEach((control) => {
        control.disabled = running;
      });
    setFields();
    persist();
  }
  function render(): void {
    let remaining = timerRemaining(state, Date.now());
    if (state.targetAt !== null && remaining <= 0) {
      const deadline = state.targetAt;
      playSound('chime');
      sendNotification(
        ko ? '타이머 완료' : 'Timer complete',
        ko ? '카운트다운이 끝났습니다.' : 'Your countdown has finished.',
      );
      status(ko ? '타이머가 완료되었습니다.' : 'Timer complete.');
      if (repeat.checked && initialMs > 0) {
        // Preserve the cadence after a late callback; never replay a backlog of alerts.
        state = {
          remainingMs: initialMs,
          targetAt: deadline + (Math.floor((Date.now() - deadline) / initialMs) + 1) * initialMs,
        };
      } else state = { remainingMs: 0, targetAt: null };
      remaining = timerRemaining(state, Date.now());
      sync();
    }
    const text = formatDuration(Math.ceil(remaining / 1000) * 1000, false);
    display.textContent = text;
    document.title =
      state.targetAt !== null
        ? text + ' · ' + (ko ? '타이머' : 'Timer')
        : state.remainingMs === 0
          ? (ko ? '완료 · ' : 'Done · ') + title
          : title;
    visual.style.setProperty(
      '--progress',
      String(initialMs ? Math.min(1, Math.max(0, 1 - remaining / initialMs)) : 0),
    );
  }
  function reset(): void {
    state = { remainingMs: initialMs, targetAt: null };
    status('');
    sync();
    render();
  }
  function toggle(): void {
    if (state.targetAt === null) {
      if (!form.reportValidity() || initialMs <= 0) {
        status(
          ko ? '0보다 긴 유효한 시간을 입력하세요.' : 'Enter a valid duration greater than zero.',
        );
        return;
      }
      unlockAudio();
      state = startTimer(state.remainingMs > 0 ? state.remainingMs : initialMs, Date.now());
      status('');
      track('timer_start');
    } else state = pauseTimer(state, Date.now());
    sync();
    render();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    toggle();
  });
  fields.forEach((field) =>
    field.addEventListener('input', () => {
      if (!form.checkValidity()) return;
      initialMs = Math.min(
        MAX_TIMER_MS,
        (Number(fields[0]!.value) * 3600 +
          Number(fields[1]!.value) * 60 +
          Number(fields[2]!.value)) *
          1000,
      );
      state = { remainingMs: initialMs, targetAt: null };
      status('');
      persist();
      render();
    }),
  );
  instrument.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((preset) =>
    preset.addEventListener('click', () => {
      initialMs = Number(preset.dataset.preset) * 1000;
      reset();
    }),
  );
  start.addEventListener('click', toggle);
  button('reset')!.addEventListener('click', reset);
  button('add')!.addEventListener('click', () => {
    const added = Math.min(60_000, MAX_TIMER_MS - initialMs);
    state = addTimerTime(state, added);
    initialMs += added;
    sync();
    render();
  });
  repeat.addEventListener('change', persist);
  button('test-sound')!.addEventListener('click', () => playSound('chime'));
  button('notifications')!.addEventListener('click', async () => {
    try {
      const permission =
        'Notification' in window ? await Notification.requestPermission() : 'denied';
      status(
        permission === 'granted'
          ? ko
            ? '완료 알림을 사용합니다.'
            : 'Completion notifications enabled.'
          : ko
            ? '알림을 사용할 수 없습니다. 페이지의 완료 표시를 확인하세요.'
            : 'Notifications unavailable. In-page completion still works.',
      );
    } catch {
      status(ko ? '알림을 사용할 수 없습니다.' : 'Notifications unavailable.');
    }
  });
  function renderPresets(): void {
    presetList.replaceChildren();
    presets.forEach((preset, index) => {
      const li = document.createElement('li');
      const load = document.createElement('button');
      const remove = document.createElement('button');
      load.type = remove.type = 'button';
      load.className = 'chip';
      load.dataset.loadPreset = String(index);
      load.textContent = preset.label + ' · ' + formatDuration(preset.milliseconds, false);
      load.disabled = state.targetAt !== null;
      load.addEventListener('click', () => {
        initialMs = preset.milliseconds;
        reset();
      });
      remove.className = 'text-button';
      remove.textContent = ko ? '삭제' : 'Remove';
      remove.setAttribute('aria-label', (ko ? '삭제: ' : 'Remove: ') + preset.label);
      remove.addEventListener('click', () => {
        presets.splice(index, 1);
        writeStored('mg-timer-presets', presets);
        renderPresets();
      });
      li.append(load, remove);
      presetList.append(li);
    });
  }
  saveForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity() || initialMs <= 0) return;
    const input = saveForm.elements.namedItem('label') as HTMLInputElement;
    const label = input.value.trim();
    if (!label) return;
    const existing = presets.findIndex((p) => p.label === label);
    if (existing < 0 && presets.length >= 8) {
      status(
        ko
          ? '기존 타이머를 삭제한 뒤 저장하세요. 최대 8개입니다.'
          : 'Remove a saved timer first. You can keep up to 8.',
      );
      return;
    }
    const preset = { label, milliseconds: initialMs };
    if (existing >= 0) presets[existing] = preset;
    else presets.push(preset);
    writeStored('mg-timer-presets', presets);
    renderPresets();
    input.value = '';
    status(ko ? '타이머를 저장했습니다.' : 'Timer saved.');
  });
  button('share-timer')!.addEventListener('click', () => {
    persist();
    void copyLink(location.href);
  });
  renderPresets();
  sync();
  render();
  setInterval(render, 200);
  document.addEventListener('visibilitychange', render);
}

function isAlarm(value: unknown): value is Alarm {
  if (!value || typeof value !== 'object') return false;
  const a = value as Partial<Alarm>;
  return (
    typeof a.id === 'string' &&
    /^[a-zA-Z0-9-]+$/.test(a.id) &&
    Number.isInteger(a.hour) &&
    a.hour! >= 0 &&
    a.hour! <= 23 &&
    Number.isInteger(a.minute) &&
    a.minute! >= 0 &&
    a.minute! <= 59 &&
    typeof a.label === 'string' &&
    typeof a.enabled === 'boolean' &&
    Array.isArray(a.weekdays) &&
    a.weekdays.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) &&
    (a.snoozedUntil === undefined || (Number.isFinite(a.snoozedUntil) && a.snoozedUntil > 0)) &&
    ['chime', 'pulse', 'bright'].includes(a.sound ?? '')
  );
}

function initAlarm(): void {
  if (!instrument) return;
  const form = instrument.querySelector<HTMLFormElement>('[data-alarm-form]')!;
  const list = instrument.querySelector<HTMLUListElement>('[data-alarm-list]')!;
  const next = instrument.querySelector<HTMLElement>('[data-next-alarm]')!;
  const ringing = instrument.querySelector<HTMLElement>('[data-ringing]')!;
  let alarms = readStored<Alarm[]>(
    'mg-alarms',
    (value) => (Array.isArray(value) && value.every(isAlarm) ? value : null),
    [],
  );
  let ringingId: string | null = null;
  const pendingAlarms: string[] = [];
  let previousCheck = new Date();
  const save = () => writeStored('mg-alarms', alarms);
  const dayNames = ko
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let renderedAlarms = '';
  function render(): void {
    const upcoming = nextAlarm(alarms, new Date());
    next.textContent = upcoming
      ? `${ko ? '다음 알람' : 'Next alarm'} · ${new Intl.DateTimeFormat(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(upcoming.at)} · ${upcoming.alarm.label}`
      : ko
        ? '활성 알람 없음'
        : 'No active alarms';
    const signature = JSON.stringify(alarms);
    if (signature === renderedAlarms) return;
    renderedAlarms = signature;
    list.innerHTML = alarms
      .map(
        (alarm) =>
          `<li data-id="${alarm.id}"><input type="checkbox" data-alarm-action="toggle" aria-label="${ko ? '알람 활성화' : 'Enable alarm'}" ${alarm.enabled ? 'checked' : ''}><div class="alarm-copy"><strong>${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')} · ${escapeHtml(alarm.label)}</strong><small>${alarm.weekdays.length ? alarm.weekdays.map((d) => dayNames[d]).join(' ') : ko ? '한 번' : 'Once'} · ${alarm.sound}</small></div><div class="list-actions"><button type="button" data-alarm-action="test" aria-label="${ko ? '소리 미리듣기' : 'Preview sound'}">♪</button><button class="danger" type="button" data-alarm-action="delete" aria-label="${ko ? '알람 삭제' : 'Delete alarm'}">×</button></div></li>`,
      )
      .join('');
  }
  function escapeHtml(value: string): string {
    const span = document.createElement('span');
    span.textContent = value;
    return span.innerHTML;
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const [hour, minute] = String(data.get('time')).split(':').map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return;
    unlockAudio();
    alarms.push({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      hour: hour!,
      minute: minute!,
      label: String(data.get('label') || (ko ? '알람' : 'Alarm'))
        .trim()
        .slice(0, 40),
      enabled: true,
      weekdays: data.getAll('weekday').map(Number),
      sound: String(data.get('sound')) as SoundName,
    });
    save();
    render();
    track('alarm_created');
    form.reset();
    (form.elements.namedItem('time') as HTMLInputElement).value = '07:30';
  });
  list.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-alarm-action]');
    if (!target) return;
    const row = target.closest<HTMLElement>('[data-id]');
    const alarm = alarms.find((a) => a.id === row?.dataset.id);
    if (!alarm) return;
    const action = target.dataset.alarmAction;
    if (action === 'toggle') return;
    if (action === 'delete') alarms = alarms.filter((a) => a.id !== alarm.id);
    else if (action === 'test') playSound(alarm.sound);
    save();
    render();
  });
  list.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.dataset.alarmAction !== 'toggle') return;
    const alarm = alarms.find((a) => a.id === target.closest<HTMLElement>('[data-id]')?.dataset.id);
    if (alarm) {
      alarm.enabled = target.checked;
      delete alarm.snoozedUntil;
      save();
      render();
    }
  });
  function check(): void {
    const now = new Date();
    const dueAlarms = alarms.filter((alarm) => isAlarmDue(alarm, now, previousCheck));
    dueAlarms.forEach((alarm) => {
      if (!pendingAlarms.includes(alarm.id)) pendingAlarms.push(alarm.id);
    });
    const nextId = ringingId ? undefined : pendingAlarms.shift();
    const due = alarms.find((alarm) => alarm.id === nextId);
    previousCheck = now;
    if (!due) {
      render();
      return;
    }
    ringingId = due.id;
    ringing.hidden = false;
    instrument!.querySelector<HTMLElement>('[data-ringing-label]')!.textContent = due.label;
    playSound(due.sound);
    sendNotification(due.label, ko ? '알람 시간입니다.' : 'Your alarm is ringing.');
    delete due.snoozedUntil;
    if (!due.weekdays.length) due.enabled = false;
    save();
    render();
  }
  button('snooze')!.addEventListener('click', () => {
    const index = alarms.findIndex((a) => a.id === ringingId);
    if (index >= 0) alarms[index] = snoozeAlarm(alarms[index]!, Date.now());
    ringing.hidden = true;
    ringingId = null;
    save();
    render();
  });
  button('dismiss')!.addEventListener('click', () => {
    ringing.hidden = true;
    ringingId = null;
    check();
  });
  button('notifications')!.addEventListener('click', async () => {
    if (!('Notification' in window))
      status(
        ko ? '이 브라우저는 알림을 지원하지 않습니다.' : 'Notifications are not supported here.',
      );
    else {
      const result = await Notification.requestPermission();
      status(
        result === 'granted'
          ? ko
            ? '알림을 사용합니다.'
            : 'Notifications enabled.'
          : ko
            ? '알림이 거부되었습니다. 페이지가 활성 상태일 때만 알람을 확인할 수 있습니다.'
            : 'Notifications denied. Alarms can only alert while the page remains active.',
      );
    }
  });
  render();
  setInterval(check, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) check();
  });
}

function populateZones(root: ParentNode, zones: string[]): void {
  root.querySelectorAll<HTMLDataListElement>('[data-zone-options]').forEach((list) => {
    list.innerHTML = zones
      .map(
        (zone) =>
          `<option value="${zone}">${displayZone(zone, ko)} ${(cityNames[zone] ?? []).join(' · ')}</option>`,
      )
      .join('');
  });
}

function initWorldClock(): void {
  if (!instrument) return;
  const zones = supportedTimeZones();
  populateZones(instrument, zones);
  const form = instrument.querySelector<HTMLFormElement>('[data-zone-form]')!;
  const list = instrument.querySelector<HTMLUListElement>('[data-world-list]')!;
  const validate = (value: unknown): string[] | null =>
    Array.isArray(value) && value.every((z) => typeof z === 'string' && validZone(z, zones))
      ? [...new Set(value)]
      : null;
  let saved = readStored<string[]>('mg-world-zones', validate, [
    ...new Set([localTimeZone(), 'UTC']),
  ]);
  let renderedZones = '';
  function save(): void {
    writeStored('mg-world-zones', saved);
  }
  function render(): void {
    const now = new Date();
    const homeDate = dateKey(now, saved[0] ?? localTimeZone());
    const structure = JSON.stringify(saved);
    if (structure === renderedZones) {
      list.querySelectorAll<HTMLElement>('[data-zone]').forEach((row) => {
        const zone = row.dataset.zone!;
        const parts = getZonedParts(now, zone);
        row.querySelector('time')!.textContent = [parts.hour, parts.minute, parts.second]
          .map((n) => String(n).padStart(2, '0'))
          .join(':');
        const key = dateKey(now, zone);
        const day =
          key === homeDate
            ? ko
              ? '같은 날'
              : 'Same day'
            : key < homeDate
              ? ko
                ? '이전 날'
                : 'Previous day'
              : ko
                ? '다음 날'
                : 'Next day';
        row.querySelector('small')!.textContent =
          day + ' · ' + timeZoneName(now, zone, locale) + ' · ' + utcOffsetLabel(now, zone);
      });
      return;
    }
    renderedZones = structure;
    list.innerHTML = saved
      .map((zone, index) => {
        const parts = getZonedParts(now, zone);
        const key = dateKey(now, zone);
        const difference =
          key === homeDate
            ? ko
              ? '같은 날'
              : 'Same day'
            : key < homeDate
              ? ko
                ? '이전 날'
                : 'Previous day'
              : ko
                ? '다음 날'
                : 'Next day';
        return `<li data-zone="${zone}"><div class="world-copy"><strong>${displayZone(zone, ko)}</strong><small>${difference} · ${timeZoneName(now, zone, locale)} · ${utcOffsetLabel(now, zone)}</small></div><time class="world-time">${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}</time><div class="list-actions"><button type="button" data-world-action="up" ${index === 0 ? 'disabled' : ''} aria-label="${ko ? '위로 이동' : 'Move up'}">↑</button><button type="button" data-world-action="down" ${index === saved.length - 1 ? 'disabled' : ''} aria-label="${ko ? '아래로 이동' : 'Move down'}">↓</button><button class="danger" type="button" data-world-action="remove" aria-label="${ko ? '삭제' : 'Remove'}">×</button></div></li>`;
      })
      .join('');
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.elements.namedItem('zone') as HTMLInputElement;
    const zone = validZone(input.value, zones);
    if (!zone) {
      status(
        ko ? '목록에서 유효한 시간대를 선택하세요.' : 'Choose a valid time zone from the list.',
      );
      return;
    }
    if (!saved.includes(zone)) {
      saved.push(zone);
      save();
      track('world_clock_added');
    }
    input.value = '';
    status('');
    render();
  });
  list.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-world-action]');
    const row = target?.closest<HTMLElement>('[data-zone]');
    if (!target || !row) return;
    const index = saved.indexOf(row.dataset.zone!);
    if (target.dataset.worldAction === 'remove') saved.splice(index, 1);
    else {
      const move = target.dataset.worldAction === 'up' ? -1 : 1;
      const other = index + move;
      if (other >= 0 && other < saved.length)
        [saved[index], saved[other]] = [saved[other]!, saved[index]!];
    }
    save();
    render();
  });
  render();
  setInterval(() => {
    if (!document.hidden) render();
  }, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) render();
  });
}

function initConverter(): void {
  if (!instrument) return;
  const zones = supportedTimeZones();
  populateZones(instrument, zones);
  const form = instrument.querySelector<HTMLFormElement>('[data-converter-form]')!;
  const source = form.elements.namedItem('source') as HTMLInputElement;
  const date = form.elements.namedItem('date') as HTMLInputElement;
  const time = form.elements.namedItem('time') as HTMLInputElement;
  const destination = form.elements.namedItem('destination') as HTMLInputElement;
  const occurrence = form.elements.namedItem('occurrence') as HTMLSelectElement;
  const choice = instrument.querySelector<HTMLElement>('[data-dst-choice]')!;
  const chips = instrument.querySelector<HTMLElement>('[data-destinations]')!;
  const results = instrument.querySelector<HTMLElement>('[data-results]')!;
  const query = new URLSearchParams(location.search);
  const prefs = readStored<{ source: string; destinations: string[] }>(
    'mg-converter',
    (value) => {
      if (!value || typeof value !== 'object') return null;
      const v = value as { source: string; destinations: string[] };
      return typeof v.source === 'string' &&
        validZone(v.source, zones) &&
        Array.isArray(v.destinations) &&
        v.destinations.length <= 12 &&
        v.destinations.every((z) => typeof z === 'string' && validZone(z, zones))
        ? v
        : null;
    },
    { source: localTimeZone(), destinations: ['UTC'] },
  );
  source.value = validZone(query.get('from') ?? '', zones) ?? prefs.source;
  let destinations = [
    ...new Set(
      (query.get('to')?.split(',') ?? prefs.destinations)
        .map((z) => validZone(z, zones))
        .filter((z): z is string => Boolean(z)),
    ),
  ].slice(0, 12);
  if (!destinations.length) destinations = ['UTC'];
  let lastInstant: Date | null = null;
  let foldKey = '';
  let sharedOccurrence = query.get('occurrence');
  function useNow(): void {
    const p = getZonedParts(new Date(), validZone(source.value, zones) ?? localTimeZone());
    date.value =
      p.year + '-' + String(p.month).padStart(2, '0') + '-' + String(p.day).padStart(2, '0');
    time.value = String(p.hour).padStart(2, '0') + ':' + String(p.minute).padStart(2, '0');
  }
  useNow();
  if (/^\d{4}-\d{2}-\d{2}$/.test(query.get('date') ?? '')) date.value = query.get('date')!;
  if (/^\d{2}:\d{2}$/.test(query.get('time') ?? '')) time.value = query.get('time')!;
  function invalidate(): void {
    results.replaceChildren();
    lastInstant = null;
    button('share-conversion')!.disabled = true;
  }
  function renderChips(): void {
    chips.replaceChildren();
    destinations.forEach((zone) => {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = displayZone(zone, ko) + ' ×';
      remove.setAttribute('aria-label', (ko ? '삭제 ' : 'Remove ') + zone);
      remove.addEventListener('click', () => {
        destinations = destinations.filter((z) => z !== zone);
        renderChips();
        convert();
      });
      chips.append(remove);
    });
  }
  function convert(): void {
    invalidate();
    const sourceZone = validZone(source.value, zones);
    if (!sourceZone || !destinations.length || !form.checkValidity()) {
      status(
        ko
          ? '유효한 날짜와 기준·목적지 시간대를 입력하세요.'
          : 'Enter a valid date and source and destination zones.',
      );
      return;
    }
    const [year, month, day] = date.value.split('-').map(Number);
    const [hour, minute] = time.value.split(':').map(Number);
    const instants = possibleInstants(
      { year: year!, month: month!, day: day!, hour: hour!, minute: minute!, second: 0 },
      sourceZone,
    );
    choice.hidden = instants.length !== 2;
    if (!instants.length) {
      status(
        ko
          ? '이 현지 시각은 시간대 전환으로 존재하지 않습니다. 다른 시간을 선택하세요.'
          : 'This local time does not exist because of a time-zone transition. Choose another time.',
      );
      return;
    }
    let instant = instants[0]!;
    if (instants.length > 1) {
      const key = sourceZone + date.value + time.value;
      if (foldKey !== key) {
        foldKey = key;
        occurrence.replaceChildren(
          new Option(ko ? '시각을 선택하세요' : 'Choose an occurrence', ''),
        );
        instants.forEach((candidate, i) =>
          occurrence.add(
            new Option(
              (i === 0 ? (ko ? '첫 번째' : 'First') : ko ? '두 번째' : 'Second') +
                ' · ' +
                utcOffsetLabel(candidate, sourceZone),
              String(i),
            ),
          ),
        );
        occurrence.value =
          sharedOccurrence === '0' || sharedOccurrence === '1' ? sharedOccurrence : '';
        sharedOccurrence = null;
      }
      if (occurrence.value === '') {
        status(
          ko
            ? '같은 시간이 두 번 발생합니다. 위에서 첫 번째 또는 두 번째 시각을 선택하세요.'
            : 'This time occurs twice. Select the first or second occurrence above.',
        );
        return;
      }
      instant = instants[Number(occurrence.value)]!;
    } else {
      foldKey = '';
      occurrence.replaceChildren();
    }
    source.value = sourceZone;
    const sourceKey = dateKey(instant, sourceZone);
    [sourceZone, ...destinations].forEach((zone, index) => {
      const card = document.createElement('div');
      card.className = 'conversion-card';
      const heading = document.createElement('strong');
      heading.textContent =
        displayZone(zone, ko) + (index === 0 ? (ko ? ' · 기준' : ' · Source') : '');
      const value = document.createElement('time');
      value.dateTime = instant.toISOString();
      value.textContent = formatInZone(instant, zone, locale);
      const detail = document.createElement('small');
      const key = dateKey(instant, zone);
      detail.textContent =
        (key === sourceKey
          ? ko
            ? '같은 날'
            : 'Same day'
          : key < sourceKey
            ? ko
              ? '이전 날'
              : 'Previous day'
            : ko
              ? '다음 날'
              : 'Next day') +
        ' · ' +
        utcOffsetLabel(instant, zone);
      card.append(heading, value, detail);
      results.append(card);
    });
    const nextQuery = new URLSearchParams({
      from: sourceZone,
      to: destinations.join(','),
      date: date.value,
      time: time.value,
    });
    if (instants.length > 1) nextQuery.set('occurrence', occurrence.value);
    history.replaceState(null, '', '?' + nextQuery.toString());
    writeStored('mg-converter', { source: sourceZone, destinations });
    lastInstant = instant;
    button('share-conversion')!.disabled = false;
    status(
      ko
        ? '변환했습니다. 시간대 조합을 저장했습니다.'
        : 'Converted. Your zone combination is saved.',
    );
  }
  button('add-zone')!.addEventListener('click', () => {
    const zone = validZone(destination.value, zones);
    if (!zone) {
      status(ko ? '목록에서 목적지를 선택하세요.' : 'Choose a destination from the list.');
      return;
    }
    if (!destinations.includes(zone) && destinations.length < 12) destinations.push(zone);
    destination.value = '';
    renderChips();
    convert();
  });
  button('swap')!.addEventListener('click', () => {
    if (!destinations.length) return;
    const old = validZone(source.value, zones);
    if (!old) return;
    const instant = lastInstant;
    source.value = destinations[0]!;
    destinations[0] = old;
    if (instant) {
      const p = getZonedParts(instant, source.value);
      date.value =
        p.year + '-' + String(p.month).padStart(2, '0') + '-' + String(p.day).padStart(2, '0');
      time.value = String(p.hour).padStart(2, '0') + ':' + String(p.minute).padStart(2, '0');
      sharedOccurrence = String(
        possibleInstants(p, source.value).findIndex((d) => d.getTime() === instant.getTime()),
      );
      foldKey = '';
    }
    renderChips();
    convert();
  });
  [source, date, time].forEach((input) =>
    input.addEventListener('input', () => {
      invalidate();
      choice.hidden = true;
      foldKey = '';
      sharedOccurrence = null;
      status(
        ko ? '시간 변환을 눌러 결과를 갱신하세요.' : 'Press Convert time to update the result.',
      );
    }),
  );
  occurrence.addEventListener('change', convert);
  button('now')!.addEventListener('click', () => {
    useNow();
    foldKey = '';
    convert();
  });
  button('share-conversion')!.addEventListener('click', () => {
    if (lastInstant) void copyLink(location.href);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    convert();
    track('timezone_conversion');
  });
  renderChips();
  convert();
}

if (instrument) {
  track('tool_open');
  configureFullscreen();
  switch (instrument.dataset.tool) {
    case 'clock':
      initClock();
      break;
    case 'stopwatch':
      initStopwatch();
      break;
    case 'timer':
      initTimer();
      break;
    case 'alarm':
      initAlarm();
      break;
    case 'world-clock':
      initWorldClock();
      break;
    case 'converter':
      initConverter();
      break;
  }
}
