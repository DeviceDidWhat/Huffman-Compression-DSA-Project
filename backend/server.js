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
app.use(cors({   // Had to enable CORS for frontend-backend communication
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '100mb' }));


app.use('/api', compressionRoutes); // Routes defined in compression.js


app.get('/download/:filename', (req, res) => { // Download api endpoint for files
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ success: false, message: 'Download failed' });
      }     
      setTimeout(() => { // Clean up file after download
        fs.unlink(filePath, (err) => {
          if (err) console.error('File cleanup error:', err);
        });
      }, 1000);
    });
  } else {
    res.status(404).json({ success: false, message: 'File not found' });
  }
});


app.use((err, req, res, next) => { // Global Error handling middleware
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


app.get('/health', (req, res) => {  // Health check endpoint api
  res.json({ status: 'ok', message: 'Huffman Compression API is running' });
});


app.listen(port, () => { // For Starting the server at port 5000
  console.log(`Huffman Compression API running at http://localhost:${port}`);
});