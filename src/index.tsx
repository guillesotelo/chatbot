import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './AppContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // Strict mode renders everythin twice in dev mode. Leave this commented.
  // <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  // </React.StrictMode>
);