const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const compressionController = require('../controllers/compressionController');

// Compress file endpoint
router.post('/compress', upload.single('file'), compressionController.compressFile);

// Decompress file endpoint
router.post('/decompress', upload.single('file'), compressionController.decompressFile);

module.exports = router;