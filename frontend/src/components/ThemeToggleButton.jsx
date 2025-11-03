import React, { useEffect, useState, useCallback } from 'react';

const THEME_STORAGE_KEY = 'ui-theme';

function getInitialTheme() {
  const persisted = localStorage.getItem(THEME_STORAGE_KEY);
  if (persisted === 'light' || persisted === 'dark') return persisted;
  // Fallback to system preference
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  }, [theme]);

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="theme-toggle"
      onClick={toggleTheme}
    >
      <span className="toggle-circle" />
      <span className="toggle-content">
        {theme === 'dark' ? (
          <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  );
};

export default ThemeToggleButton;


