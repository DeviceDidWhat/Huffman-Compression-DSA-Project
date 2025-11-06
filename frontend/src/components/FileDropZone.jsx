import { useState } from "react";

const FileDropZone = ({ onFileSelect, disabled, mode, selectedFile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const hasFile = selectedFile !== null && selectedFile !== undefined;

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragCounter(prev => prev + 1);
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragCounter(prev => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragOver(false);
        }
        return newCounter;
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragCounter(0);
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
        } ${hasFile ? "file-selected" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="dropzone-overlay">
            <div className="overlay-content">
              <svg
                className="overlay-icon"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
              >
                <path d="M21 15V19C21 19.5 20.8 20 20.4 20.4C20 20.8 19.5 21 19 21H5C4.5 21 4 20.8 3.6 20.4C3.2 20 3 19.5 3 19V15" />
                <path d="M17 8L12 3L7 8" />
                <path d="M12 3V15" />
              </svg>
              <h2 className="overlay-text">Drop your file here!</h2>
              <div className="overlay-badge">
                {mode === "compress" && "Text File (.txt)"}
                {mode === "decompress" && "Compressed File (.huff)"}
                {mode === "compress-image" && "Image File (.png, .jpg, .jpeg)"}
                {mode === "decompress-image" && "Compressed Image (.huffimg)"}
              </div>
            </div>
          </div>
        )}

        <input
          type="file"
          id="file-input"
          className="file-input"
          disabled={disabled}
          accept={
            mode === "compress"
              ? ".txt"
              : mode === "decompress"
              ? ".huff"
              : mode === "compress-image"
              ? ".png,.jpg,.jpeg,image/png,image/jpeg"
              : ".huffimg"
          }
          onChange={handleFileChange}
        />

        <label htmlFor="file-input" className="file-label">
          <div className="dropzone-content">
            <div className="icon-wrapper">
              {hasFile ? (
                <svg
                  className="file-icon"
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              ) : (
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
              )}
            </div>

            <div className="dropzone-text">
              {hasFile ? (
                <>
                  <h3 className="dropzone-title">
                    {selectedFile?.name || "File selected"}
                  </h3>
                  <p className="dropzone-subtitle">
                    Click to select a different file
                  </p>
                </>
              ) : (
                <>
                  <h3 className="dropzone-title">
                    Drag and drop your file
                  </h3>
                  <p className="dropzone-subtitle">
                    or click to <span className="browse-text">browse</span>
                  </p>
                </>
              )}
            </div>

            {!disabled && !isDragOver && !hasFile && (
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
