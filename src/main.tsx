import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './config/firebase'; // Initialize Firebase
import './styles/globals.css';
import ErrorBoundary from './presentation/components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
