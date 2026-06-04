import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress ENS warning on custom testnets
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('ENS') || args[0]?.includes?.('UNSUPPORTED_OPERATION')) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (JSON.stringify(args)?.includes?.('getEnsAddress')) return;
  originalError(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
