import React, { useState, useCallback } from 'react';

const FileDropZone = ({ onFileSelect, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (files) => {
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (!disabled) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleFileChange = useCallback(
    (e) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  return (
    <div className="dropzone-container">
      <div
        className={`dropzone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          className="file-input"
          onChange={handleFileChange}
          disabled={disabled}
          accept=".txt,.huff"
        />
        <label htmlFor="file-input" className="file-label">
          <div className="dropzone-content">
            <div className="icon-wrapper">
              <svg 
                className="upload-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M17 8L12 3L7 8" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M12 3V15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              {isDragOver && (
                <div className="pulse-ring"></div>
              )}
            </div>
            
            <div className="dropzone-text">
              <h3 className="dropzone-title">
                {isDragOver
                  ? 'Drop it here!'
                  : disabled
                  ? 'Processing your file...'
                  : 'Drop your file here'}
              </h3>
              <p className="dropzone-subtitle">
                {!isDragOver && !disabled && (
                  <>or click to <span className="browse-text">browse</span></>
                )}
              </p>
            </div>

            {!isDragOver && !disabled && (
              <div className="file-types">
                <span className="file-type-badge">.txt</span>
                <span className="file-type-badge">.huff</span>
              </div>
            )}
          </div>
        </label>
        
        {isDragOver && <div className="dropzone-overlay"></div>}
      </div>
    </div>
  );
};

export default FileDropZone;