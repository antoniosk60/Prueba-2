import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './utils/mockFetch'; // Intercept all /api calls for offline standalone GitHub Pages compatibility
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
