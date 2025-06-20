import { createContext, useContext } from 'react';

import { Theme,ThemeState } from './types';

interface ThemeContextType extends ThemeState {
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

export { ThemeContext };
