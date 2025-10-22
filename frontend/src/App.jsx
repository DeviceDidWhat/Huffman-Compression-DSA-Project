import { useState, useEffect, useCallback } from 'react'
import './App.css'
import AppHeader from './components/AppHeader'
import FileDropZone from './components/FileDropZone'
import FileInfoDisplay from './components/FileInfoDisplay'
import StatusCard from './components/StatusCard'
import { validateFile, formatBytes, saveToHistory, getCompressionHistory } from './lib/utils'

const API_URL = 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('compress'); // 'compress' or 'decompress'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);

  // Load compression history on component mount
  useEffect(() => {
    const savedHistory = getCompressionHistory();
    if (savedHistory && savedHistory.length > 0) {
      setHistory(savedHistory);
    }
  }, []);

  const handleFileChange = useCallback((selectedFile) => {
    if (selectedFile) {
      try {
        validateFile(selectedFile); // Fixed: removed mode parameter
        setFile(selectedFile);
        setError(null);
        setResult(null);
        setStatus('selected');
      } catch (err) {
        // Fixed: catch the error thrown by validateFile
        setError(err.message);
        setFile(null);
        setStatus('idle');
      }
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setStatus('compressing');
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = mode === 'compress' ? '/api/compress' : '/api/decompress';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: formData
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      }

      const data = await response.json();
      setResult(data);
      setStatus('success');
      setProgress(100);
      
      // Save to history
      saveToHistory({
        fileName: file.name,
        originalSize: file.size,
        compressedSize: data.size,
        mode,
        timestamp: new Date().toISOString(),
        downloadPath: data.downloadPath
      });
      
      // Update history state
      setHistory(getCompressionHistory());
    } catch (err) {
      setError(err.message || 'An error occurred');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result && result.downloadPath) {
      window.open(`${API_URL}${result.downloadPath}`, '_blank');
    }
  };

  const handleRetry = () => {
    setError(null);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="app-container">
      <div className="container">
        <AppHeader />
        
        <div className="card">
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'compress' ? 'active' : ''}`}
              onClick={() => {
                setMode('compress');
                setFile(null);
                setResult(null);
                setError(null);
                setStatus('idle');
              }}
            >
              Compress
            </button>
            <button
              className={`mode-btn ${mode === 'decompress' ? 'active' : ''}`}
              onClick={() => {
                setMode('decompress');
                setFile(null);
                setResult(null);
                setError(null);
                setStatus('idle');
              }}
            >
              Decompress
            </button>
          </div>

          <FileDropZone 
            onFileSelect={handleFileChange} 
            disabled={loading} 
          />

          <StatusCard 
            status={status} 
            progress={progress} 
            onRetry={handleRetry} 
          />

          {error && <div className="error-message">{error}</div>}

          {file && (
            <div className="action-container">
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading || status === 'error'}
              >
                {loading ? 'Processing...' : mode === 'compress' ? 'Compress' : 'Decompress'}
              </button>
            </div>
          )}

          {result && (
            <div className="result-container">
              <FileInfoDisplay 
                fileName={file?.name}
                fileSize={file?.size}
                compressedSize={result.size}
                newFileName={result.fileName}
              />
              <button className="download-btn" onClick={handleDownload}>
                Download File
              </button>
            </div>
          )}
        </div>

        <div className="info-box">
          <h3>About Huffman Coding</h3>
          <p>
            Huffman coding is a lossless data compression algorithm that assigns variable-length codes to input characters, with shorter codes for more frequent characters.
          </p>
          <p>
            This application allows you to compress text files using Huffman coding and decompress previously compressed files.
          </p>
        </div>

        {history.length > 0 && (
          <div className="history-container card">
            <h3>Compression History</h3>
            <div className="history-list">
              {history.slice(0, 5).map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-item-info">
                    <div className="history-item-name">{item.fileName}</div>
                    <div className="history-item-stats">
                      {formatBytes(item.originalSize)} → {formatBytes(item.compressedSize)} 
                      ({((1 - item.compressedSize / item.originalSize) * 100).toFixed(2)}%)
                    </div>
                  </div>
                  {item.downloadPath && (
                    <button 
                      className="history-download-btn"
                      onClick={() => window.open(`${API_URL}${item.downloadPath}`, '_blank')}
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App