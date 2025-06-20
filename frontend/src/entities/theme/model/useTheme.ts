import { useEffect, useState } from 'react';

import { Theme, ThemeState } from './types';

const STORAGE_KEY = 'theme';

export const useTheme = (): ThemeState & { setTheme: (theme: Theme) => void } => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme;
    return saved || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const getActualTheme = (selectedTheme: Theme): 'light' | 'dark' => {
      if (selectedTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return selectedTheme;
    };

    const applyTheme = (selectedTheme: Theme) => {
      const actual = getActualTheme(selectedTheme);
      setActualTheme(actual);
      document.documentElement.setAttribute('data-theme', actual);
    };

    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return {
    theme,
    actualTheme,
    setTheme,
  };
};
