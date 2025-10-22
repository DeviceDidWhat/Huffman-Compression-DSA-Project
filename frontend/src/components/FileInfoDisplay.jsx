import React from 'react';
import { formatBytes } from '../lib/utils';

const FileInfoDisplay = ({ fileName, fileSize, compressedSize, newFileName }) => {
  const compressionRatio = compressedSize ? ((1 - compressedSize / fileSize) * 100).toFixed(2) : 0;
  
  return (
    <div className="file-info">
      <h3 className="file-info-title">File Information</h3>
      
      <div className="file-info-item">
        <span className="file-info-label">File Name:</span>
        <span className="file-info-value">{fileName}</span>
      </div>
      
      <div className="file-info-item">
        <span className="file-info-label">Original Size:</span>
        <span className="file-info-value">{formatBytes(fileSize)}</span>
      </div>
      
      {compressedSize > 0 && (
        <>
          <div className="file-info-item">
            <span className="file-info-label">Compressed Size:</span>
            <span className="file-info-value">{formatBytes(compressedSize)}</span>
          </div>
          
          <div className="file-info-item highlight">
            <span className="file-info-label">Compression Ratio:</span>
            <span className="file-info-value">{compressionRatio}%</span>
          </div>
          
          {newFileName && (
            <div className="file-info-item">
              <span className="file-info-label">Output File:</span>
              <span className="file-info-value">{newFileName}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileInfoDisplay;