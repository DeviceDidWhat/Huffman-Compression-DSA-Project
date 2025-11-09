import React from "react";
import { formatBytes } from "../lib/utils";

const FileInfoDisplay = ({
  fileName,
  fileSize,
  compressedSize,
  newFileName,
  isImage,
  imageUrl,
  width,
  height,
  mode,
  originalFileSize,
}) => {
  const isDecompression = mode === "decompress" || mode === "decompress-image";

  const compressionRatio = compressedSize
    ? ((1 - compressedSize / fileSize) * 100).toFixed(2)
    : 0;

  return (
    <div className="file-info-display">
      <div className="file-info-header">
        <svg
          className="info-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 2V9H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="info-title">File Details</h3>
      </div>

      {isImage && imageUrl && (
        <div className="image-preview">
          <img
            src={imageUrl}
            alt="Decompressed preview"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
          {width && height && (
            <p
              className="image-dimensions"
              style={{
                textAlign: "center",
                marginTop: "8px",
                fontSize: "14px",
                color: "var(--text-secondary)",
              }}
            >
              Dimensions: {width} × {height}
            </p>
          )}
        </div>
      )}

      <div className="info-grid">
        <div className="info-card">
          <div className="info-card-icon">📄</div>
          <div className="info-card-content">
            <span className="info-label">File Name</span>
            <span className="info-value">{fileName}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-card-icon">📊</div>
          <div className="info-card-content">
            <span className="info-label">
              {isDecompression ? "Compressed File Size" : "Original Size"}
            </span>
            <span className="info-value">{formatBytes(fileSize)}</span>
          </div>
        </div>

        {compressedSize > 0 && (
          <>
            <div className="info-card">
              <div className="info-card-icon">🗜</div>
              <div className="info-card-content">
                <span className="info-label">
                  {isDecompression ? "Decompressed Size" : "Compressed Size"}
                </span>
                <span className="info-value">
                  {formatBytes(compressedSize)}
                </span>
              </div>
            </div>

            {!isDecompression && (
              <div className="info-card highlight-card">
                <div className="info-card-icon">⚡</div>
                <div className="info-card-content">
                  <span className="info-label">Space Saved</span>
                  <span className="info-value highlight-value">
                    {compressionRatio}%
                  </span>
                </div>
                <div className="sparkle sparkle-1"></div>
                <div className="sparkle sparkle-2"></div>
              </div>
            )}

            {isDecompression && originalFileSize && (
              <div className="info-card">
                <div className="info-card-icon">📦</div>
                <div className="info-card-content">
                  <span className="info-label">Original File Size</span>
                  <span className="info-value">
                    {formatBytes(originalFileSize)}
                  </span>
                </div>
              </div>
            )}

            {newFileName && (
              <div className="info-card full-width">
                <div className="info-card-icon">💾</div>
                <div className="info-card-content">
                  <span className="info-label">Output File</span>
                  <span className="info-value output-name">{newFileName}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {compressedSize > 0 && !isDecompression && (
        <div className="compression-visual">
          <div className="visual-bar">
            <div className="original-bar">
              <span className="bar-label">Original</span>
            </div>
            <div
              className="compressed-bar"
              style={{
                width: `${100 - parseFloat(compressionRatio)}%`,
              }}
            >
              <span className="bar-label">Compressed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileInfoDisplay;
