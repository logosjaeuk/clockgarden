import {
  sampleLifetimeMs,
  ticketSites,
  timeAnchor,
  validTimeReply,
  type TimeAnchor,
} from '../lib/ticket-sites';

const root = document.querySelector<HTMLElement>('[data-server-time]');
if (root) {
  const ko = root.dataset.locale === 'ko';
  const pick = <T extends HTMLElement = HTMLElement>(name: string) =>
    root.querySelector<T>(`[data-${name}]`)!;
  const check = pick<HTMLButtonElement>('check');
  const official = pick<HTMLAnchorElement>('official');
  const opening = root.querySelector<HTMLInputElement>('#ticket-opening')!;
  const formatTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const formatDate = new Intl.DateTimeFormat(ko ? 'ko-KR' : 'en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  let site: string = ticketSites[0].id;
  let anchor: TimeAnchor | null = null;
  let openingMs: number | null = null;
  let requestId = 0;
  let controller: AbortController | null = null;
  let retryAt = 0;
  let checking = false;

  function clearMeasurement() {
    anchor = null;
    for (const name of ['server-date', 'offset', 'uncertainty', 'age', 'date-header'])
      pick(name).textContent = '—';
    pick('server-clock').textContent = '--:--:--';
  }
  function setSite(id: string) {
    const next = ticketSites.find((item) => item.id === id);
    if (!next) return;
    requestId++;
    controller?.abort();
    controller = null;
    checking = false;
    retryAt = 0;
    site = id;
    clearMeasurement();
    root!
      .querySelectorAll<HTMLButtonElement>('[data-site]')
      .forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.site === id)));
    official.href = next.url;
    pick('source').textContent = next.url;
    pick('state').textContent = ko ? '조회 전' : 'Not measured';
    pick('message').textContent = ko
      ? '시간 조회를 누르면 선택한 사이트에 연결합니다.'
      : 'Press Check time to connect to the selected website.';
    const url = new URL(location.href);
    url.searchParams.set('site', id);
    history.replaceState(null, '', url);
    render();
  }
  const errors: Record<string, string> = ko
    ? {
        upstream: '사이트가 조회를 허용하지 않거나 정상 응답을 보내지 않았습니다.',
        'missing-date': '응답에 읽을 수 있는 시간 정보가 없습니다.',
        'cached-response': '캐시된 응답이어서 현재 시간으로 사용할 수 없습니다.',
        'stale-date': '응답 시각이 오래되었거나 큰 차이가 있어 사용하지 않습니다.',
        redirect: '조회 주소가 바뀌어 시간 출처를 확인할 수 없습니다.',
        timeout: '조회 시간이 초과되었습니다. 잠시 후 다시 시도하세요.',
        network: '시간 조회에 연결할 수 없습니다. 연결 상태와 조회 기능을 확인하세요.',
      }
    : {
        upstream: 'The website blocked the check or did not return a successful response.',
        'missing-date': 'The response has no readable time information.',
        'cached-response': 'A cached response cannot be used as current time.',
        'stale-date': 'The response timestamp is too old or differs too much to use.',
        redirect: 'The source address changed and could not be verified.',
        timeout: 'The check timed out. Try again later.',
        network:
          'Unable to connect to the time service. Check your connection and service availability.',
      };
  async function measure() {
    if (checking || performance.now() < retryAt || document.hidden) return;
    const token = ++requestId;
    checking = true;
    clearMeasurement();
    pick('state').textContent = ko ? '조회 중' : 'Checking';
    pick('message').textContent = ko
      ? '선택한 사이트의 응답 시간을 확인하고 있습니다.'
      : 'Reading the response time of the selected website.';
    const activeController = new AbortController();
    controller = activeController;
    const timeout = setTimeout(() => activeController.abort(), 15_000);
    const sent = performance.now();
    render();
    try {
      const response = await fetch(`/api/server-time?site=${encodeURIComponent(site)}`, {
        cache: 'no-store',
        credentials: 'omit',
        signal: activeController.signal,
      });
      const received = performance.now();
      const payload: unknown = await response.json();
      if (token !== requestId) return;
      if (!response.ok) {
        const failure = payload as { error?: string; upstreamStatus?: number };
        const message = errors[failure.error ?? 'network'] ?? errors.network!;
        throw new Error(
          message + (failure.upstreamStatus ? ` (HTTP ${failure.upstreamStatus})` : ''),
        );
      }
      if (!validTimeReply(payload, site)) throw new Error(errors.network);
      anchor = timeAnchor(payload, sent, received);
      pick('date-header').textContent = payload.dateHeader;
      pick('state').textContent = ko ? '추정값' : 'Estimated';
      pick('message').textContent = ko
        ? '웹 응답 시각을 기준으로 표시 중입니다. 실제 예매 시작은 공식 예매처에서 확인하세요.'
        : 'Showing estimated web response time. Confirm sale opening on the official website.';
    } catch (error) {
      if (token !== requestId) return;
      clearMeasurement();
      pick('state').textContent = ko ? '조회 불가' : 'Unavailable';
      pick('message').textContent =
        error instanceof Error && error.name !== 'SyntaxError' && error.name !== 'TypeError'
          ? error.name === 'AbortError'
            ? errors.timeout!
            : error.message
          : errors.network!;
    } finally {
      clearTimeout(timeout);
      if (token === requestId) {
        checking = false;
        controller = null;
        retryAt = performance.now() + 10_000;
        render();
      }
    }
  }
  function render() {
    const monotonic = performance.now();
    const deviceNow = Date.now();
    pick('device-clock').textContent = formatTime.format(deviceNow);
    check.disabled = checking || monotonic < retryAt;
    const seconds = Math.ceil((retryAt - monotonic) / 1_000);
    check.textContent = checking
      ? ko
        ? '조회 중…'
        : 'Checking…'
      : seconds > 0
        ? ko
          ? `${seconds}초 후 재조회`
          : `Retry in ${seconds}s`
        : ko
          ? '시간 조회'
          : 'Check time';
    let estimate: number | null = null;
    if (anchor) {
      const elapsed = monotonic - anchor.monotonicMs;
      const age = anchor.sampleAgeMs + elapsed;
      if (age >= sampleLifetimeMs) {
        clearMeasurement();
        pick('state').textContent = ko ? '재조회 필요' : 'Check again';
        pick('message').textContent = ko
          ? '측정 후 2분이 지났습니다. 시간을 다시 조회하세요.'
          : 'The sample is two minutes old. Check time again.';
      } else {
        estimate = anchor.epochMs + elapsed;
        pick('server-clock').textContent = formatTime.format(estimate);
        pick('server-date').textContent = formatDate.format(estimate);
        const offset = (estimate - deviceNow) / 1_000;
        pick('offset').textContent = ko
          ? `${Math.abs(offset).toFixed(1)}초 ${offset >= 0 ? '앞섬' : '뒤처짐'}`
          : `${offset >= 0 ? '+' : '−'}${Math.abs(offset).toFixed(1)} s`;
        pick('uncertainty').textContent =
          `± ${(anchor.uncertaintyMs / 1_000).toFixed(1)} ${ko ? '초 (추정)' : 's (estimate)'}`;
        pick('age').textContent = `${Math.floor(age / 1_000)}${ko ? '초' : ' s'}`;
      }
    }
    if (openingMs !== null) {
      pick('countdown').textContent =
        estimate === null
          ? ko
            ? '시간을 조회하면 카운트다운을 표시합니다.'
            : 'Check time to display the countdown.'
          : (() => {
              const total = Math.ceil((openingMs - estimate) / 1_000);
              if (total <= 0)
                return ko
                  ? '설정한 시각이 지났습니다. 공식 예매처에서 오픈 여부를 확인하세요.'
                  : 'The entered time has passed. Check the official website for sale availability.';
              const hours = Math.floor(total / 3_600);
              const minutes = Math.floor((total % 3_600) / 60);
              return ko
                ? `설정한 시각까지 ${hours}시간 ${minutes}분 ${total % 60}초 (추정)`
                : `${hours}h ${minutes}m ${total % 60}s until the entered time (estimate)`;
            })();
    }
  }
  root
    .querySelectorAll<HTMLButtonElement>('[data-site]')
    .forEach((button) => button.addEventListener('click', () => setSite(button.dataset.site!)));
  check.addEventListener('click', () => void measure());
  pick<HTMLFormElement>('countdown-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const parsed = Date.parse(opening.value + '+09:00');
    if (!Number.isFinite(parsed)) {
      pick('countdown').textContent = ko
        ? '올바른 날짜와 시각을 입력하세요.'
        : 'Enter a valid date and time.';
      return;
    }
    openingMs = parsed;
    render();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      requestId++;
      controller?.abort();
      controller = null;
      checking = false;
      clearMeasurement();
      pick('state').textContent = ko ? '재조회 필요' : 'Check again';
      pick('message').textContent = ko
        ? '탭으로 돌아왔습니다. 시간을 다시 조회하세요.'
        : 'Check time again after returning to this tab.';
    } else render();
  });
  const initial = new URL(location.href).searchParams.get('site');
  if (initial) setSite(initial);
  render();
  setInterval(() => {
    if (!document.hidden) render();
  }, 100);
}
