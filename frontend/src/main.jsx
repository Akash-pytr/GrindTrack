import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
