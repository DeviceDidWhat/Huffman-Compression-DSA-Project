const fs = require('fs');
const path = require('path');
const HuffmanCoding = require('../utils/huffman');

// Compress file
exports.compressFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Compress using Huffman coding
    const huffman = new HuffmanCoding();
    const compressed = huffman.compress(fileContent);

    // Convert binary string to buffer
    const { buffer, padding } = huffman.binaryStringToBuffer(compressed.encodedText);

    // Create compressed file with metadata
    const metadata = {
      codes: compressed.codes,
      padding: padding,
      originalSize: fileContent.length,
      originalName: req.file.originalname
    };

    // Save compressed file
    const compressedFileName = `${path.parse(req.file.originalname).name}.huff`;
    const compressedFilePath = path.join(req.file.destination, compressedFileName);

    // Write metadata as JSON and compressed data
    const metadataStr = JSON.stringify(metadata);
    const metadataLength = Buffer.byteLength(metadataStr, 'utf8');
    const metadataLengthBuffer = Buffer.alloc(4);
    metadataLengthBuffer.writeUInt32BE(metadataLength, 0);

    const finalBuffer = Buffer.concat([
      metadataLengthBuffer,
      Buffer.from(metadataStr, 'utf8'),
      buffer
    ]);

    fs.writeFileSync(compressedFilePath, finalBuffer);

    // Calculate compression ratio
    const originalSize = fileContent.length;
    const compressedSize = finalBuffer.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    // Delete original uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File compressed successfully',
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`,
      filename: compressedFileName,
      downloadPath: `/download/${compressedFileName}`
    });

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Compression failed', 
      error: error.message 
    });
  }
};

// Decompress file
exports.decompressFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Read metadata length
    const metadataLength = fileBuffer.readUInt32BE(0);
    
    // Read metadata
    const metadataStr = fileBuffer.slice(4, 4 + metadataLength).toString('utf8');
    const metadata = JSON.parse(metadataStr);

    // Read compressed data
    const compressedBuffer = fileBuffer.slice(4 + metadataLength);

    // Decompress using Huffman coding
    const huffman = new HuffmanCoding();
    const binaryString = huffman.bufferToBinaryString(compressedBuffer, metadata.padding);
    const decompressedText = huffman.decompress(binaryString, metadata.codes);

    // Save decompressed file
    const decompressedFileName = `decompressed_${metadata.originalName}`;
    const decompressedFilePath = path.join(req.file.destination, decompressedFileName);
    fs.writeFileSync(decompressedFilePath, decompressedText, 'utf8');

    // Delete uploaded compressed file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File decompressed successfully',
      originalSize: metadata.originalSize,
      decompressedSize: decompressedText.length,
      filename: decompressedFileName,
      downloadPath: `/download/${decompressedFileName}`
    });

  } catch (error) {
    console.error('Decompression error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Decompression failed', 
      error: error.message 
    });
  }
};