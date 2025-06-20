export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  actualTheme: 'light' | 'dark';
}
