export const readFileAsText = (file) => { // read file as text
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const readFileAsArrayBuffer = (file) => { // read file as ArrayBuffer
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const validateFile = (file, mode) => { // validate file type and size
  if (!file) {
    throw new Error('No file selected');
  }


  if (file.size > 100 * 1024 * 1024) {  // Check file size (limit to 100MB)
    throw new Error('File size exceeds 100MB limit');
  }

  // Check file type based on mode
  if (mode === 'compress' && !file.name.endsWith('.txt')) {
    throw new Error('Please select a .txt file for compression');
  } else if (mode === 'decompress' && !file.name.endsWith('.huff')) {
    throw new Error('Please select a .huff file for decompression');
  } else if (mode === 'compress-image') {
    const validImageTypes = ['.png', '.jpg', '.jpeg'];
    const hasValidExtension = validImageTypes.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
      throw new Error('Please select a .png, .jpg, or .jpeg file for image compression');
    }
  } else if (mode === 'decompress-image' && !file.name.endsWith('.huffimg')) {
    throw new Error('Please select a .huffimg file for image decompression');
  }

  return true;
};

export const formatBytes = (bytes, decimals = 2) => { // Format bytes to human-readable format
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const saveToHistory = (compressionData) => { // Save compression history to localStorage
  try {   
    const history = JSON.parse(localStorage.getItem('compressionHistory') || '[]'); // Get existing history  
    const safeData = { // Ensure all required fields have values
      fileName: compressionData.fileName || 'Unknown file',
      originalSize: compressionData.originalSize || 0,
      compressedSize: compressionData.compressedSize || 0,
      mode: compressionData.mode || 'compress',
      timestamp: new Date().toISOString(),
      fileContent: compressionData.fileContent || null,
      downloadPath: compressionData.downloadPath || null
    };  
    history.unshift(safeData);  // Add new entry at the beginning  
    const trimmedHistory = history.slice(0, 10); // Keep only the last 10 entries
    localStorage.setItem('compressionHistory', JSON.stringify(trimmedHistory));     // Save back to localStorage
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const getCompressionHistory = () => { // Get compression history from localStorage
  try {
    return JSON.parse(localStorage.getItem('compressionHistory') || '[]');
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

export const clearCompressionHistory = () => { // Clear compression history
  localStorage.removeItem('compressionHistory');
};