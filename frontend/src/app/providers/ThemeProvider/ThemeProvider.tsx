import { useTheme } from '@entities/theme';
import { FC, PropsWithChildren } from 'react';

const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  useTheme();

  return <>{children}</>;
};

export default ThemeProvider;
