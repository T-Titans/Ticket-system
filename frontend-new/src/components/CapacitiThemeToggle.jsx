import React from 'react';
import { useCapacitiTheme } from '../contexts/CapacitiThemeContext';
import '../components/CapacitiTheme.css';

const CapacitiThemeToggle = () => {
  const { isDarkMode, showLeopardPattern, toggleTheme, toggleLeopardPattern } = useCapacitiTheme();

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '12px' }}>
      {/* Theme Toggle Button */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <svg 
          className="theme-toggle-icon" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isDarkMode ? (
            // Sun icon for light mode
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          ) : (
            // Moon icon for dark mode
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          )}
        </svg>
        {isDarkMode ? 'Light' : 'Dark'}
      </button>

      {/* Leopard Pattern Toggle */}
      <button 
        className="theme-toggle" 
        onClick={toggleLeopardPattern}
        title={`${showLeopardPattern ? 'Hide' : 'Show'} leopard pattern`}
        style={{ 
          background: showLeopardPattern 
            ? 'linear-gradient(135deg, #D4A574, #B8956A)' 
            : 'linear-gradient(135deg, #6B5437, #8B6F47)',
          opacity: showLeopardPattern ? 1 : 0.7
        }}
      >
        <svg 
          className="theme-toggle-icon" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        Pattern
      </button>
    </div>
  );
};

export default CapacitiThemeToggle;