import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {SiteDataProvider} from './lib/site/SiteDataProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteDataProvider>
      <App />
    </SiteDataProvider>
  </StrictMode>,
);
