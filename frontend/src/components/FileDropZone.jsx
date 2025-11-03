import React, { useState } from "react";

const FileDropZone = ({ onFileSelect, disabled, mode }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    onFileSelect(e.target.files[0]);
  };

  return (
    <div className="dropzone-container">
      <div
        className={`dropzone ${isDragOver ? "drag-over" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          className="file-input"
          disabled={disabled}
          accept={
            mode === "compress" ? ".txt" :
            mode === "decompress" ? ".huff" :
            mode === "compress-image" ? ".png,.jpg,.jpeg,image/png,image/jpeg" :
            ".huffimg"
          }
          onChange={handleFileChange}
        />

        <label htmlFor="file-input" className="file-label">
          <div className="dropzone-content">
            <svg
              className="upload-icon"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
            >
              <path d="M21 15V19C21 19.5 20.8 20 20.4 20.4C20 20.8 19.5 21 19 21H5C4.5 21 4 20.8 3.6 20.4C3.2 20 3 19.5 3 19V15" />
              <path d="M17 8L12 3L7 8" />
              <path d="M12 3V15" />
            </svg>

            <h3 className="dropzone-title">
              {isDragOver ? "Drop it here!" : "Drag and drop your file"}
            </h3>

            {!isDragOver && (
              <p className="dropzone-subtitle">
                or click to <span className="browse-text">browse</span>
              </p>
            )}

            {!disabled && (
              <div className="file-types">
                {mode === "compress" && (
                  <span className="file-type-badge">.txt</span>
                )}
                {mode === "decompress" && (
                  <span className="file-type-badge">.huff</span>
                )}
                {mode === "compress-image" && (
                  <>
                    <span className="file-type-badge">.png</span>
                    <span className="file-type-badge">.jpg</span>
                    <span className="file-type-badge">.jpeg</span>
                  </>
                )}
                {mode === "decompress-image" && (
                  <span className="file-type-badge">.huffimg</span>
                )}
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileDropZone;
