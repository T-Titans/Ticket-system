import React, { useState, useEffect } from 'react';
import { useCapacitiTheme } from '../contexts/CapacitiThemeContext';
import './DashboardThemes.css';

const DASHBOARD_THEMES = [
  {
    id: 'leopard-pro',
    name: 'Leopard Professional',
    colors: {
      primary: '#D4A574',
      secondary: '#B8956A',
      accent: '#C49969',
      background: '#FEFCF9',
      card: '#FFFFFF',
      text: '#2C2319'
    },
    gradient: 'linear-gradient(135deg, #D4A574, #B8956A)',
    icon: '🐆'
  },
  {
    id: 'dark-leopard',
    name: 'Dark Leopard',
    colors: {
      primary: '#E6C492',
      secondary: '#D4A574',
      accent: '#C49969',
      background: '#1A1611',
      card: '#2C2319',
      text: '#F2E0C7'
    },
    gradient: 'linear-gradient(135deg, #2C2319, #3D2F22)',
    icon: '🌙'
  },
  {
    id: 'enterprise-blue',
    name: 'Enterprise Blue',
    colors: {
      primary: '#3498db',
      secondary: '#2980b9',
      accent: '#5dade2',
      background: '#f8f9fa',
      card: '#ffffff',
      text: '#2c3e50'
    },
    gradient: 'linear-gradient(135deg, #3498db, #2980b9)',
    icon: '🏢'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    colors: {
      primary: '#27ae60',
      secondary: '#229954',
      accent: '#58d68d',
      background: '#f7f9f7',
      card: '#ffffff',
      text: '#1e3a1e'
    },
    gradient: 'linear-gradient(135deg, #27ae60, #229954)',
    icon: '🌲'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    colors: {
      primary: '#e67e22',
      secondary: '#d35400',
      accent: '#f39c12',
      background: '#fdf6f0',
      card: '#ffffff',
      text: '#8b4513'
    },
    gradient: 'linear-gradient(135deg, #e67e22, #d35400)',
    icon: '🌅'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    colors: {
      primary: '#8e44ad',
      secondary: '#7d3c98',
      accent: '#bb8fce',
      background: '#f4f2f7',
      card: '#ffffff',
      text: '#4a235a'
    },
    gradient: 'linear-gradient(135deg, #8e44ad, #7d3c98)',
    icon: '👑'
  }
];

const DashboardThemeSelector = ({ onThemeChange, currentTheme = 'leopard-pro' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const { isDarkMode } = useCapacitiTheme();

  useEffect(() => {
    // Apply theme to dashboard
    applyTheme(DASHBOARD_THEMES.find(t => t.id === selectedTheme) || DASHBOARD_THEMES[0]);
  }, [selectedTheme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-${key}`, value);
    });
    root.style.setProperty('--dashboard-gradient', theme.gradient);
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    setIsOpen(false);
    if (onThemeChange) {
      onThemeChange(themeId);
    }
    
    // Save theme preference
    localStorage.setItem('dashboard-theme', themeId);
  };

  const currentThemeData = DASHBOARD_THEMES.find(t => t.id === selectedTheme) || DASHBOARD_THEMES[0];

  return (
    <div className={`theme-selector-container ${isDarkMode ? 'dark' : 'light'}`}>
      <button 
        className="theme-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: currentThemeData.gradient }}
      >
        <span className="theme-icon">{currentThemeData.icon}</span>
        <span className="theme-name">{currentThemeData.name}</span>
        <svg 
          className={`chevron-icon ${isOpen ? 'open' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-header">
            <h3>Choose Dashboard Theme</h3>
            <p>Customize your workspace appearance</p>
          </div>
          
          <div className="theme-grid">
            {DASHBOARD_THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div 
                  className="theme-preview" 
                  style={{ background: theme.gradient }}
                >
                  <span className="theme-preview-icon">{theme.icon}</span>
                </div>
                <div className="theme-info">
                  <div className="theme-title">{theme.name}</div>
                  <div className="theme-colors">
                    {Object.entries(theme.colors).slice(0, 3).map(([key, color]) => (
                      <div 
                        key={key} 
                        className="color-dot" 
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
                {selectedTheme === theme.id && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
          
          <div className="theme-dropdown-footer">
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardThemeSelector;