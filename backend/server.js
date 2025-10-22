const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const compressionRoutes = require('./routes/compression');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', compressionRoutes);

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ success: false, message: 'Download failed' });
      }
      // Clean up file after download
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('File cleanup error:', err);
        });
      }, 1000);
    });
  } else {
    res.status(404).json({ success: false, message: 'File not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Huffman Compression API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Huffman Compression API running at http://localhost:${port}`);
});