import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import { setupHttpInterceptor } from './utils/httpInterceptor';

// Initialize global fetch interceptor for 401s / expired tokens
setupHttpInterceptor();

createRoot(document.getElementById('root')).render(
<AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
);
