import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './AppContext';
import GoogleAnalytics from './components/GoogleAnalytics';
import ReactGA from 'react-ga4';
const TRACKING_ID = "G-V6HK4YH119";
ReactGA.initialize(TRACKING_ID);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // Strict mode renders everythin twice in dev mode. Leave this commented.
  // <React.StrictMode>
  <AppProvider>
    <GoogleAnalytics />
    <App />
  </AppProvider>
  // </React.StrictMode>
);