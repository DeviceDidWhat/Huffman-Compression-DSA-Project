import React from 'react';
import ThemeToggleButton from './ThemeToggleButton';

const AppHeader = () => {
  return (
    <div className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-container">
            <svg 
              className="logo-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2L2 7L12 12L22 7L12 2Z" 
                className="logo-path"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M2 17L12 22L22 17" 
                className="logo-path"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M2 12L12 17L22 12" 
                className="logo-path"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="title-section">
            <h1 className="main-title">
              <span className="title-gradient">Huffman</span>
              <span className="title-light">Compress</span>
            </h1>
            <p className="subtitle">
              <span className="subtitle-dot">•</span>
              Lossless Data Compression
              <span className="subtitle-dot">•</span>
            </p>
          </div>
        </div>
        <div className="header-actions">
          <div className="header-badge">
            <span className="badge-text">DSA Project</span>
          </div>
          <ThemeToggleButton />
        </div>
      </div>
      <div className="header-divider"></div>
    </div>
  );
};

export default AppHeader;