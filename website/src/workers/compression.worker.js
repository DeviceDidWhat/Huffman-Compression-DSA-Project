import { HuffmanCompressor } from '../lib/huffman.js';
import { readFileAsText } from '../lib/utils.js';

// Initialize Huffman compressor
const compressor = new HuffmanCompressor();

// Handle messages from main thread
self.onmessage = async (e) => {
  try {
    const { file } = e.data;
    
    // Read file content
    const text = await readFileAsText(file);
    
    // Compress text
    const compressed = compressor.compress(text);
    
    // Create compressed file with metadata
    const finalBuffer = compressor.createCompressedFile(
      compressed.encodedText,
      compressed.codes,
      file.name
    );
    
    // Create blob from buffer
    const blob = new Blob([finalBuffer], { type: 'application/octet-stream' });
    
    // Send result back to main thread
    self.postMessage({
      success: true,
      data: {
        blob,
        originalSize: compressed.originalSize,
        size: finalBuffer.byteLength,
        compressionRatio: compressed.compressionRatio
      }
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};