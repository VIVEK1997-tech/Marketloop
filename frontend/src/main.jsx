import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import AppErrorBoundary from './components/AppErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { sanitizePersistedState } from './utils/storage.js';
import './styles.css';

sanitizePersistedState();

const isMobilePaymentBridge = typeof window !== 'undefined' && window.location.pathname.startsWith('/mobile-payment-bridge');

window.addEventListener('error', (event) => {
  console.error('MarketLoop global error:', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack || ''
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('MarketLoop unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        {isMobilePaymentBridge ? (
          <App />
        ) : (
          <ThemeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        )}
      </AppErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
