// Read file as text
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

// Read file as ArrayBuffer
export const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Validate file type and size
export const validateFile = (file, mode) => {
  // Check if file exists
  if (!file) {
    throw new Error('No file selected');
  }

  // Check file size (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Check file type based on mode
  if (mode === 'compress' && !file.name.endsWith('.txt')) {
    throw new Error('Please select a .txt file for compression');
  } else if (mode === 'decompress' && !file.name.endsWith('.huff')) {
    throw new Error('Please select a .huff file for decompression');
  }

  return true;
};

// Format bytes to human-readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Save compression history to localStorage
export const saveToHistory = (compressionData) => {
  try {
    // Get existing history
    const history = JSON.parse(localStorage.getItem('compressionHistory') || '[]');
    
    // Ensure all required fields have values
    const safeData = {
      fileName: compressionData.fileName || 'Unknown file',
      originalSize: compressionData.originalSize || 0,
      compressedSize: compressionData.compressedSize || 0,
      mode: compressionData.mode || 'compress',
      timestamp: new Date().toISOString(),
      fileContent: compressionData.fileContent || null,
      downloadPath: compressionData.downloadPath || null
    };
    
    // Add new entry
    history.unshift(safeData);
    
    // Keep only the last 10 entries
    const trimmedHistory = history.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('compressionHistory', JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

// Get compression history from localStorage
export const getCompressionHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('compressionHistory') || '[]');
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

// Clear compression history
export const clearCompressionHistory = () => {
  localStorage.removeItem('compressionHistory');
};