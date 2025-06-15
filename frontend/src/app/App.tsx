import './styles/index.scss';

import ThemeSwitcher from '@features/ThemeSwitcher';

import ThemeProvider from './providers/ThemeProvider';

const App = () => {
  return (
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>
  );
};

export default App;
