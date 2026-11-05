type Theme = 'system' | 'light' | 'dark';
const themes: Theme[] = ['system', 'light', 'dark'];
const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle');

function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem('mg-theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {}
  return 'system';
}

let theme: Theme = getSavedTheme();

function applyTheme(): void {
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.dataset.theme = theme;
  }

  if (themeButton) {
    const labels: Record<Theme, string> =
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
  const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
  theme = themes[nextIdx] ?? 'system';
  try {
    localStorage.setItem('mg-theme', theme);
  } catch {}
  applyTheme();
});

const languageLink = document.querySelector<HTMLAnchorElement>('.language-link');
if (languageLink) {
  languageLink.href += location.search;
}
