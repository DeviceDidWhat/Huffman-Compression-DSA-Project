const fs = require('fs');
const path = require('path');
const HuffmanCoding = require('../utils/huffman');

exports.compressFile = async (req, res) => { // Compress file
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const huffman = new HuffmanCoding();     // Compressing using Huffman coding
    const compressed = huffman.compress(fileContent);

 
    const { buffer, padding } = huffman.binaryStringToBuffer(compressed.encodedText);   // Converts binary string to buffer

    const metadata = { // Creates compressed file with metadata
      codes: compressed.codes,
      padding: padding,
      originalSize: fileContent.length,
      originalName: req.file.originalname
    };

    const compressedFileName = `${path.parse(req.file.originalname).name}.huff`;     // Saves compressed file
    const compressedFilePath = path.join(req.file.destination, compressedFileName);

    const metadataStr = JSON.stringify(metadata);     // Write metadata as JSON and compressed data
    const metadataLength = Buffer.byteLength(metadataStr, 'utf8');
    const metadataLengthBuffer = Buffer.alloc(4);
    metadataLengthBuffer.writeUInt32BE(metadataLength, 0);

    const finalBuffer = Buffer.concat([
      metadataLengthBuffer,
      Buffer.from(metadataStr, 'utf8'),
      buffer
    ]);

    fs.writeFileSync(compressedFilePath, finalBuffer);

    const originalSize = fileContent.length;     // Calculates compression ratio
    const compressedSize = finalBuffer.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    fs.unlinkSync(filePath);   // Deletes original uploaded file

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

exports.decompressFile = async (req, res) => { // This is for decompression of file
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    const metadataLength = fileBuffer.readUInt32BE(0);   //will read metadata length
    
    const metadataStr = fileBuffer.slice(4, 4 + metadataLength).toString('utf8'); // read metadata
    const metadata = JSON.parse(metadataStr);
 
    const compressedBuffer = fileBuffer.slice(4 + metadataLength); // read compressed data
 
    const huffman = new HuffmanCoding(); // decompress using huffman coding
    const binaryString = huffman.bufferToBinaryString(compressedBuffer, metadata.padding);
    const decompressedText = huffman.decompress(binaryString, metadata.codes);
 
    const decompressedFileName = `decompressed_${metadata.originalName}`; // will save decompressed file
    const decompressedFilePath = path.join(req.file.destination, decompressedFileName);
    fs.writeFileSync(decompressedFilePath, decompressedText, 'utf8');
  
    fs.unlinkSync(filePath); // delete uploaded compressed file

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