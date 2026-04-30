import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readStoredValue, writeStoredValue } from '../utils/storage.js';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'marketloop-theme';

const getSystemPreference = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'system';
  return readStoredValue(STORAGE_KEY, 'system');
};

const applyThemeToDocument = (theme) => {
  if (typeof document === 'undefined') return;
  const resolvedTheme = theme === 'system' ? getSystemPreference() : theme;
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.dataset.theme = resolvedTheme;
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => (getStoredTheme() === 'system' ? getSystemPreference() : getStoredTheme()));

  useEffect(() => {
    applyThemeToDocument(theme);
    const nextResolved = theme === 'system' ? getSystemPreference() : theme;
    setResolvedTheme(nextResolved);
    writeStoredValue(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const nextResolved = media.matches ? 'dark' : 'light';
        setResolvedTheme(nextResolved);
        document.documentElement.classList.toggle('dark', nextResolved === 'dark');
        document.documentElement.dataset.theme = nextResolved;
      }
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
