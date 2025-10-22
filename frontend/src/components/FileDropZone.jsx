import React, { useState, useCallback } from 'react';

const FileDropZone = ({ onFileSelect, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Memoized handlers
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
    <div
      className={`dropzone ${isDragOver ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
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
        <div className="icon" style={{ fontSize: '3rem', color: '#4a6cf7' }}>📁</div>
        <div className="text" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
          {isDragOver
            ? 'Drop file here'
            : disabled
            ? 'Processing...'
            : 'Drag & drop file here or click to browse'}
        </div>
        <div className="hint" style={{ color: '#555', fontSize: '0.9rem' }}>Supports .txt files for compression and .huff files for decompression</div>
      </label>
    </div>
  );
};

export default FileDropZone;