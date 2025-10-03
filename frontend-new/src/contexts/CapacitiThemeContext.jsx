import React, { createContext, useContext, useState, useEffect } from 'react';

const CapacitiThemeContext = createContext();

export const useCapacitiTheme = () => {
  const context = useContext(CapacitiThemeContext);
  if (!context) {
    throw new Error('useCapacitiTheme must be used within a CapacitiThemeProvider');
  }
  return context;
};

export const CapacitiThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLeopardPattern, setShowLeopardPattern] = useState(true);

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('capaciti-theme');
    const savedPattern = localStorage.getItem('capaciti-leopard-pattern');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    
    if (savedPattern !== null) {
      setShowLeopardPattern(savedPattern === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply theme to body
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    
    // Save preference
    localStorage.setItem('capaciti-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    // Save leopard pattern preference
    localStorage.setItem('capaciti-leopard-pattern', showLeopardPattern.toString());
  }, [showLeopardPattern]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleLeopardPattern = () => {
    setShowLeopardPattern(!showLeopardPattern);
  };

  const value = {
    isDarkMode,
    showLeopardPattern,
    toggleTheme,
    toggleLeopardPattern,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <CapacitiThemeContext.Provider value={value}>
      {children}
    </CapacitiThemeContext.Provider>
  );
};

export default CapacitiThemeContext;