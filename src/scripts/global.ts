import { readStored, writeStored } from '../lib/storage';

type Theme = 'system' | 'light' | 'dark';
const themes: Theme[] = ['system', 'light', 'dark'];
const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle');
let theme = readStored<Theme>(
  'mg-theme',
  (value) => (themes.includes(value as Theme) ? (value as Theme) : null),
  'system',
);

function applyTheme(): void {
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.dataset.theme = theme;
  if (themeButton) {
    const labels =
      root.lang === 'ko'
        ? { system: '시스템 테마', light: '밝은 테마', dark: '어두운 테마' }
        : { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };
    themeButton.title = labels[theme];
    themeButton.setAttribute('aria-label', labels[theme]);
    themeButton.textContent = theme === 'system' ? '◐' : theme === 'light' ? '☀' : '☾';
  }
}

applyTheme();
themeButton?.addEventListener('click', () => {
  theme = themes[(themes.indexOf(theme) + 1) % themes.length] ?? 'system';
  writeStored('mg-theme', theme);
  applyTheme();
});

const languageLink = document.querySelector<HTMLAnchorElement>('.language-link');
if (languageLink) languageLink.href += location.search;
document.querySelector<HTMLAnchorElement>('.language-link')?.addEventListener('click', (event) => {
  if (languageLink) {
    const url = new URL(languageLink.href);
    url.search = location.search;
    languageLink.href = url.href;
  }
  const locale = (event.currentTarget as HTMLAnchorElement | null)?.hreflang;
  if (locale === 'en' || locale === 'ko') writeStored('mg-locale', locale);
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener(
    'load',
    () => void navigator.serviceWorker.register('/sw.js').catch(() => {}),
  );
}
