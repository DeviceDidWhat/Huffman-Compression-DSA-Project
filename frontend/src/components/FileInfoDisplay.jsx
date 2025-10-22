import React from 'react';
import { formatBytes } from '../lib/utils';

const FileInfoDisplay = ({ fileName, fileSize, compressedSize, newFileName }) => {
  const compressionRatio = compressedSize ? ((1 - compressedSize / fileSize) * 100).toFixed(2) : 0;
  
  return (
    <div className="file-info">
      <h3 className="file-info-title">File Information</h3>
      
      <div className="file-info-item">
        <span className="file-info-label" style={{ color: '#555', fontWeight: 'bold' }}>File Name:</span>
        <span className="file-info-value" style={{ color: '#333' }}>{fileName}</span>
      </div>
      
      <div className="file-info-item">
        <span className="file-info-label" style={{ color: '#555', fontWeight: 'bold' }}>Original Size:</span>
        <span className="file-info-value" style={{ color: '#333' }}>{formatBytes(fileSize)}</span>
      </div>
      
      {compressedSize > 0 && (
        <>
          <div className="file-info-item">
            <span className="file-info-label" style={{ color: '#555', fontWeight: 'bold' }}>Compressed Size:</span>
            <span className="file-info-value" style={{ color: '#333' }}>{formatBytes(compressedSize)}</span>
          </div>
          
          <div className="file-info-item highlight">
            <span className="file-info-label" style={{ color: '#555', fontWeight: 'bold' }}>Compression Ratio:</span>
            <span className="file-info-value" style={{ color: '#333' }}>{compressionRatio}%</span>
          </div>
          
          {newFileName && (
            <div className="file-info-item">
              <span className="file-info-label" style={{ color: '#555', fontWeight: 'bold' }}>Output File:</span>
              <span className="file-info-value" style={{ color: '#333' }}>{newFileName}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileInfoDisplay;