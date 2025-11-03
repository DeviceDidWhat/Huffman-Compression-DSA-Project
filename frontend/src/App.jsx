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
  const [mode, setMode] = useState('compress'); // 'compress', 'decompress', 'compress-image', 'decompress-image'
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
        validateFile(selectedFile, mode);
        setFile(selectedFile);
        setError(null);
        setResult(null);
        setStatus('selected');
      } catch (err) {
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
    setStatus('processing');
    setProgress(10);

    try {
      let result;

      // Handle image compression/decompression
      if (mode === 'compress-image' || mode === 'decompress-image') {
        const HuffmanImageCompressor = (await import('./lib/huffmanImage.js')).default;
        const imageCompressor = new HuffmanImageCompressor();

        setProgress(30);

        if (mode === 'compress-image') {
          const compressed = await imageCompressor.compress(file);

          result = {
            fileName: compressed.filename,
            originalSize: compressed.originalSize,
            compressedSize: compressed.compressedSize,
            compressionRatio: compressed.compressionRatio,
            fileContent: compressed.data,
            width: compressed.width,
            height: compressed.height,
            success: true,
            isImage: true
          };
        } else {
          const decompressed = await imageCompressor.decompress(file);

          result = {
            fileName: decompressed.filename,
            originalSize: decompressed.originalSize,
            compressedSize: decompressed.decompressedSize,
            fileContent: decompressed.blob,
            width: decompressed.width,
            height: decompressed.height,
            success: true,
            isImage: true,
            imageUrl: decompressed.imageUrl
          };
        }
      } else {
        // Handle text compression/decompression
        const { HuffmanCompressor } = await import('./lib/huffman.js');
        const compressor = new HuffmanCompressor();

        setProgress(30);

        // Read file content
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('Failed to read file'));

          if (mode === 'compress') {
            reader.readAsText(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        });

        setProgress(50);

        if (mode === 'compress') {
          // Compress text content
          const compressed = compressor.compress(fileContent);

          // Create compressed file with metadata
          const compressedFile = compressor.createCompressedFile(
            compressed.encodedText,
            compressed.serializedTree,
            file.name
          );

          result = {
            fileName: file.name.replace(/\.[^/.]+$/, '') + '.huff',
            originalSize: file.size,
            compressedSize: compressedFile.actualSize,
            compressionRatio: compressed.compressionRatio,
            fileContent: compressedFile.buffer,
            success: true
          };
        } else {
          // Decompress content
          const buffer = fileContent;

          try {
            // Read compressed file metadata
            const { encodedText, metadata } = compressor.readCompressedFile(buffer);

            // Decompress using the tree from metadata
            const decompressedText = compressor.decompress(
              encodedText,
              metadata.tree,
              metadata.padding
            );

            result = {
              fileName: metadata.originalName || file.name.replace('.huff', '.txt'),
              originalSize: file.size,
              compressedSize: decompressedText.length,
              compressionRatio: ((file.size - decompressedText.length) / file.size * 100).toFixed(2),
              fileContent: decompressedText,
              success: true
            };
          } catch (decompressError) {
            throw new Error('Failed to decompress file: ' + decompressError.message);
          }
        }
      }

      setProgress(80);

      // Create download link for compressed/decompressed file
      let blob;
      let downloadUrl;

      if (result.isImage && mode === 'decompress-image') {
        blob = result.fileContent;
        downloadUrl = result.imageUrl;
      } else {
        const blobType = mode === 'compress' ? 'application/octet-stream'
                       : mode === 'compress-image' ? 'application/octet-stream'
                       : result.isImage ? 'image/png'
                       : 'text/plain';
        blob = new Blob([result.fileContent], { type: blobType });
        downloadUrl = URL.createObjectURL(blob);
      }

      setResult({
        ...result,
        downloadUrl,
        mode
      });

      setStatus('success');
      setProgress(100);

      // Save to history
      if (mode === 'compress' || mode === 'compress-image') {
        saveToHistory({
          fileName: file.name,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          timestamp: new Date().toISOString(),
          mode: mode
        });
      }
    } catch (err) {
      console.error('Operation failed:', err);
      setError(err.message || `${mode} failed`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result && result.fileContent) {
      // Use the actual compressed/decompressed content
      const fileType = mode === 'compress' ? 'application/octet-stream' : 'text/plain';
      const fileName = result.fileName || (mode === 'compress' 
        ? (file?.name?.replace(/\.[^/.]+$/, '') || 'compressed') + '.huff'
        : (file?.name?.replace(/\.huff$/, '') || 'decompressed') + '.txt');
      
      // Create and download the file
      const blob = new Blob([result.fileContent], { type: fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
              Text Compress
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
              Text Decompress
            </button>
            <button
              className={`mode-btn ${mode === 'compress-image' ? 'active' : ''}`}
              onClick={() => {
                setMode('compress-image');
                setFile(null);
                setResult(null);
                setError(null);
                setStatus('idle');
              }}
            >
              Image Compress
            </button>
            <button
              className={`mode-btn ${mode === 'decompress-image' ? 'active' : ''}`}
              onClick={() => {
                setMode('decompress-image');
                setFile(null);
                setResult(null);
                setError(null);
                setStatus('idle');
              }}
            >
              Image Decompress
            </button>
          </div>

         <FileDropZone 
            onFileSelect={handleFileChange} 
            disabled={loading}
            mode={mode}   // ✅ add this line
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
                {loading ? 'Processing...' :
                 mode === 'compress' ? 'Compress Text' :
                 mode === 'decompress' ? 'Decompress Text' :
                 mode === 'compress-image' ? 'Compress Image' :
                 'Decompress Image'}
              </button>
            </div>
          )}

          {result && (
            <div className="result-container">
              <FileInfoDisplay
                fileName={file?.name}
                fileSize={result.originalSize}
                compressedSize={result.compressedSize}
                newFileName={result.fileName}
                isImage={result.isImage}
                imageUrl={result.imageUrl}
                width={result.width}
                height={result.height}
              />
              <button className="download-btn" onClick={handleDownload}>
                Download File
              </button>
            </div>
          )}
        </div>

        <div className="info-box card">
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
                    <div className="history-item-name">{item.fileName || 'Unknown file'}</div>
                    <div className="history-item-stats">
                      {formatBytes(item.originalSize || 0)} → {formatBytes(item.compressedSize || 0)} 
                      ({item.originalSize && item.compressedSize ? ((1 - item.compressedSize / item.originalSize) * 100).toFixed(2) : '0.00'}%)
                    </div>
                  </div>
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