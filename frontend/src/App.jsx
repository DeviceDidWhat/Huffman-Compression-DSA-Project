import { useState, useEffect, useCallback } from 'react'
import './App.css'
import AppHeader from './components/AppHeader'
import FileDropZone from './components/FileDropZone'
import FileInfoDisplay from './components/FileInfoDisplay'
import StatusCard from './components/StatusCard'
import CodeTable from './components/CodeTable'
import { validateFile, formatBytes, saveToHistory, getCompressionHistory } from './lib/utils'

const API_URL = 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('text'); // 'text' or 'image'
  const [mode, setMode] = useState('compress'); // 'compress' or 'decompress'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [huffmanTree, setHuffmanTree] = useState(null);
  const [huffmanCodes, setHuffmanCodes] = useState(null);
  const [showVisualization, setShowVisualization] = useState(false);

  // Derive actual mode from fileType + mode
  const getActualMode = () => {
    if (fileType === 'image') {
      return mode === 'compress' ? 'compress-image' : 'decompress-image';
    }
    return mode;
  };

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
        const actualMode = fileType === 'image'
          ? (mode === 'compress' ? 'compress-image' : 'decompress-image')
          : mode;
        validateFile(selectedFile, actualMode);
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
  }, [fileType, mode]);

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
      const actualMode = getActualMode();

      // Handle image compression/decompression
      if (actualMode === 'compress-image' || actualMode === 'decompress-image') {
        const HuffmanImageCompressor = (await import('./lib/huffmanImage.js')).default;
        const imageCompressor = new HuffmanImageCompressor();

        setProgress(30);

        if (actualMode === 'compress-image') {
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

          if (actualMode === 'compress') {
            reader.readAsText(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        });

        setProgress(50);

        if (actualMode === 'compress') {
          // Compress text content
          const compressed = compressor.compress(fileContent);

          // Store Huffman tree and codes for visualization
          const frequency = compressor.buildFrequencyMap(fileContent);
          const tree = compressor.buildHuffmanTree(frequency);
          compressor.generateCodes(tree);
          setHuffmanTree(tree);
          setHuffmanCodes(compressor.codes);

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

      if (result.isImage && actualMode === 'decompress-image') {
        blob = result.fileContent;
        downloadUrl = result.imageUrl;
      } else {
        const blobType = actualMode === 'compress' ? 'application/octet-stream'
                       : actualMode === 'compress-image' ? 'application/octet-stream'
                       : result.isImage ? 'image/png'
                       : 'text/plain';
        blob = new Blob([result.fileContent], { type: blobType });
        downloadUrl = URL.createObjectURL(blob);
      }

      setResult({
        ...result,
        downloadUrl,
        mode: actualMode
      });

      setStatus('success');
      setProgress(100);

      // Save to history
      if (actualMode === 'compress' || actualMode === 'compress-image') {
        saveToHistory({
          fileName: file.name,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          timestamp: new Date().toISOString(),
          mode: actualMode
        });
      }
    } catch (err) {
      console.error('Operation failed:', err);
      setError(err.message || `${actualMode} failed`);
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
          {/* File Type Selector */}
          <div className="file-type-selector" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Select file type:
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className={`mode-btn ${fileType === 'text' ? 'active' : ''}`}
                onClick={() => {
                  setFileType('text');
                  setFile(null);
                  setResult(null);
                  setError(null);
                  setStatus('idle');
                }}
              >
                Text
              </button>
              <button
                className={`mode-btn ${fileType === 'image' ? 'active' : ''}`}
                onClick={() => {
                  setFileType('image');
                  setFile(null);
                  setResult(null);
                  setError(null);
                  setStatus('idle');
                }}
              >
                Image
              </button>
            </div>
          </div>

          {/* Mode Selector */}
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
            mode={getActualMode()}
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
                 mode === 'compress' ? `Compress ${fileType === 'image' ? 'Image' : 'Text'}` :
                 `Decompress ${fileType === 'image' ? 'Image' : 'Text'}`}
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

              {/* Visualization Toggle Button - Only show for text compression */}
              {huffmanTree && huffmanCodes && fileType === 'text' && mode === 'compress' && (
                <button
                  className={`visualization-toggle ${showVisualization ? 'open' : ''}`}
                  onClick={() => setShowVisualization(!showVisualization)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="toggle-icon">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  {showVisualization ? 'Hide Visualization' : 'Show Code Table'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Huffman Tree Code Table */}
        {huffmanTree && huffmanCodes && fileType === 'text' && mode === 'compress' && showVisualization && (
          <>
            <CodeTable
              codes={huffmanCodes}
              isVisible={showVisualization}
            />
          </>
        )}

        <div className="info-box card">
          <h3>About Huffman Coding</h3>
          <p>
            Huffman coding is a data compression algorithm that assigns variable-length codes to input data, with shorter codes for more frequent elements.
          </p>
          <p>
            This application allows you to compress both <strong>text files</strong> (lossless) and <strong>images</strong> (lossy with color quantization) using Huffman coding.
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