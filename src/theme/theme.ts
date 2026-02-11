// Olive Baby Web - Theme utilities

export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'olive-baby-theme';
const THEME_VERSION_KEY = 'olive-baby-theme-v';
// Incrementar esta versão para forçar reset do tema para todos os usuários
const CURRENT_THEME_VERSION = '2';

/**
 * Migrate theme to current version.
 * When the version changes, stored theme is reset to 'light' (default).
 * After migration, users can choose any theme and it will persist.
 */
function migrateThemeIfNeeded(): void {
  if (typeof window === 'undefined') return;

  const storedVersion = localStorage.getItem(THEME_VERSION_KEY);
  if (storedVersion !== CURRENT_THEME_VERSION) {
    // Reset para tema claro na primeira visita com nova versão
    localStorage.setItem(THEME_KEY, 'light');
    localStorage.setItem(THEME_VERSION_KEY, CURRENT_THEME_VERSION);
  }
}

/**
 * Get the stored theme from localStorage
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  // Garantir que a migração aconteça antes de ler o tema
  migrateThemeIfNeeded();
  
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  // Padrão: tema claro para todas as aplicações (OlieCare, Prof, Admin)
  return 'light';
}

/**
 * Store the theme in localStorage
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Get the system preference for dark mode
 */
export function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get the resolved theme (what should actually be applied)
 */
export function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemPreference();
  }
  return theme;
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const resolvedTheme = getResolvedTheme(theme);
  
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'
    );
  }
}

/**
 * Initialize theme on page load (should be called early)
 */
export function initializeTheme(): void {
  const theme = getStoredTheme();
  applyTheme(theme);
}
