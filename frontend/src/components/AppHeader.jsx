import React from 'react';

const AppHeader = () => {
  return (
    <div className="app-header">
      <div className="app-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
      </div>
      <div>
        <h1 className="app-title">Huffman Compression</h1>
        <p className="app-subtitle">DSA Project - Lossless Text Compression</p>
      </div>
    </div>
  );
};

export default AppHeader;