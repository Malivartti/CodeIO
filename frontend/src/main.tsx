import App from '@app/App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';


const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found in index.html');
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
