import { useTheme } from '@entities/theme';
import { ThemeContext } from '@entities/theme';
import { FC, PropsWithChildren } from 'react';

const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const themeState = useTheme();

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
