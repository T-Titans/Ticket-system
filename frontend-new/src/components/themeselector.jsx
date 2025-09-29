import React, { useState, useEffect } from 'react';

const themes = [
  { id: 'light', name: '☀️ Light', color: '#3498db' },
  { id: 'dark', name: '🌙 Dark', color: '#4a9eff' },
  { id: 'gold', name: '✨ Gold', color: '#d4af37' },
  { id: 'red', name: '❤️ Red', color: '#dc2626' },
  { id: 'blue', name: '💙 Blue', color: '#0ea5e9' },
  { id: 'green', name: '💚 Green', color: '#10b981' },
  { id: 'purple', name: '💜 Purple', color: '#8b5cf6' },
  { id: 'ocean', name: '🌊 Ocean', color: '#0d9488' }
];

function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className="theme-selector">
      <button 
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        🎨 {currentThemeData?.name || 'Theme'}
      </button>
      
      <div className={`theme-options ${isOpen ? 'open' : ''}`}>
        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-btn ${currentTheme === theme.id ? 'active' : ''}`}
            onClick={() => changeTheme(theme.id)}
            style={{ 
              borderLeftColor: theme.color,
              borderLeftWidth: '4px'
            }}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSelector;