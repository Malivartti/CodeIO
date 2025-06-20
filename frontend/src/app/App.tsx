import './styles/index.scss';

import AppRouter from '@app/providers/AppRouter';
import ErrorBoundary from '@app/providers/ErrorBoundary';

import ThemeProvider from './providers/ThemeProvider';

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
