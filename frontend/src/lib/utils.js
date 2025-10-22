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
export const validateFile = (file) => {
  // Check if file exists
  if (!file) {
    throw new Error('No file selected');
  }

  // Check file type for compression (only .txt files)
  if (file.name.endsWith('.txt')) {
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
  } 
  // Check file type for decompression (only .huff files)
  else if (file.name.endsWith('.huff')) {
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
  } else {
    throw new Error('Invalid file type. Only .txt and .huff files are supported');
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
    
    // Add new entry with timestamp
    history.unshift({
      ...compressionData,
      timestamp: new Date().toISOString()
    });
    
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