const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const compressionController = require('../controllers/compressionController');
router.post('/compress', upload.single('file'), compressionController.compressFile); // Compress file endpoint
router.post('/decompress', upload.single('file'), compressionController.decompressFile); // Decompress file endpoint
module.exports = router;