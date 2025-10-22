class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

export class HuffmanCompressor {
  constructor() {
    this.codes = {};
    this.reverseMapping = {};
  }

  // Build frequency map
  buildFrequencyMap(text) {
    const frequency = {};
    for (let char of text) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    return frequency;
  }

  // Build Huffman tree
  buildHuffmanTree(frequency) {
    const heap = Object.entries(frequency).map(([char, freq]) => 
      new HuffmanNode(char, freq)
    );

    // Sort by frequency (min heap)
    heap.sort((a, b) => a.freq - b.freq);

    while (heap.length > 1) {
      const left = heap.shift();
      const right = heap.shift();

      const merged = new HuffmanNode(null, left.freq + right.freq);
      merged.left = left;
      merged.right = right;

      heap.push(merged);
      heap.sort((a, b) => a.freq - b.freq);
    }

    return heap[0];
  }

  // Generate codes from tree
  generateCodes(node, currentCode = '') {
    if (!node) return;

    if (node.char !== null) {
      this.codes[node.char] = currentCode || '0';
      this.reverseMapping[currentCode || '0'] = node.char;
      return;
    }

    this.generateCodes(node.left, currentCode + '0');
    this.generateCodes(node.right, currentCode + '1');
  }

  // Serialize tree to compact format (pre-order traversal)
  serializeTree(node) {
    if (!node) return '';
    
    // If leaf node, mark with '1' followed by the character
    if (node.char !== null) {
      // Use 1 bit for leaf marker + character code
      return '1' + node.char;
    }
    
    // If internal node, mark with '0'
    return '0' + this.serializeTree(node.left) + this.serializeTree(node.right);
  }

  // Deserialize tree from compact format
  deserializeTree(data) {
    let index = 0;
    
    const buildTree = () => {
      if (index >= data.length) return null;
      
      const marker = data[index++];
      
      if (marker === '1') {
        // Leaf node - next character is the actual character
        const char = data[index++];
        return new HuffmanNode(char, 0);
      } else {
        // Internal node
        const node = new HuffmanNode(null, 0);
        node.left = buildTree();
        node.right = buildTree();
        return node;
      }
    };
    
    return buildTree();
  }

  // Compress text
  compress(text) {
    if (!text || text.length === 0) {
      throw new Error('Text is empty');
    }

    // Build frequency map
    const frequency = this.buildFrequencyMap(text);

    // Build Huffman tree
    const root = this.buildHuffmanTree(frequency);

    // Generate codes
    this.codes = {};
    this.reverseMapping = {};
    this.generateCodes(root);

    // Encode text
    let encodedText = '';
    for (let char of text) {
      encodedText += this.codes[char];
    }

    // Serialize the tree (much smaller than storing all codes)
    const serializedTree = this.serializeTree(root);

    // Calculate compression ratio
    const originalBits = text.length * 8;
    const compressedBits = encodedText.length;
    
    // Account for tree size in compression ratio
    const treeSize = serializedTree.length * 8; // Each char is ~8 bits
    const totalCompressedBits = compressedBits + treeSize;
    const compressionRatio = (1 - totalCompressedBits / originalBits) * 100;

    return {
      encodedText,
      serializedTree,
      codes: this.codes,
      originalSize: text.length,
      size: Math.ceil(encodedText.length / 8) + serializedTree.length,
      compressionRatio: compressionRatio.toFixed(2),
      actualSavings: compressionRatio > 0
    };
  }

  // Decompress using serialized tree
  decompress(encodedText, serializedTree, padding = 0) {
    // Deserialize tree
    const root = this.deserializeTree(serializedTree);
    
    // Remove padding bits
    const validBits = encodedText.substring(0, encodedText.length - padding);
    
    // Traverse tree to decode
    let decoded = '';
    let current = root;
    
    // Handle single character case
    if (!root.left && !root.right) {
      // Single character repeated
      for (let i = 0; i < validBits.length; i++) {
        decoded += root.char;
      }
      return decoded;
    }
    
    for (let bit of validBits) {
      current = bit === '0' ? current.left : current.right;
      
      if (current.char !== null) {
        decoded += current.char;
        current = root;
      }
    }
    
    return decoded;
  }

  // Convert binary string to Uint8Array
  binaryStringToUint8Array(binaryString) {
    const padding = (8 - (binaryString.length % 8)) % 8;
    const paddedBinaryString = binaryString + '0'.repeat(padding);
    
    const bytes = new Uint8Array(Math.ceil(paddedBinaryString.length / 8));
    
    for (let i = 0; i < paddedBinaryString.length; i += 8) {
      const byte = paddedBinaryString.substr(i, 8);
      bytes[i / 8] = parseInt(byte, 2);
    }
    
    return { bytes, padding };
  }

  // Create compressed file with metadata (using serialized tree instead of codes)
  createCompressedFile(encodedText, serializedTree, fileName) {
    // Convert binary string to bytes
    const { bytes, padding } = this.binaryStringToUint8Array(encodedText);
    
    // Create minimal metadata (tree instead of all codes)
    const metadata = {
      tree: serializedTree,  // Much smaller than storing all codes!
      padding,
      originalName: fileName
    };
    
    // Convert metadata to JSON string
    const metadataStr = JSON.stringify(metadata);
    
    // Create metadata length buffer (4 bytes)
    const metadataLength = metadataStr.length;
    const metadataLengthBuffer = new Uint8Array(4);
    metadataLengthBuffer[0] = (metadataLength >> 24) & 0xFF;
    metadataLengthBuffer[1] = (metadataLength >> 16) & 0xFF;
    metadataLengthBuffer[2] = (metadataLength >> 8) & 0xFF;
    metadataLengthBuffer[3] = metadataLength & 0xFF;
    
    // Combine all buffers
    const metadataBuffer = new TextEncoder().encode(metadataStr);
    const finalBuffer = new Uint8Array(4 + metadataBuffer.length + bytes.length);
    
    finalBuffer.set(metadataLengthBuffer, 0);
    finalBuffer.set(metadataBuffer, 4);
    finalBuffer.set(bytes, 4 + metadataBuffer.length);
    
    // Calculate actual file size with metadata
    const actualCompressedSize = finalBuffer.length;
    
    return { 
      buffer: finalBuffer,
      actualSize: actualCompressedSize
    };
  }

  // Convert Uint8Array to binary string
  uint8ArrayToBinaryString(bytes) {
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += bytes[i].toString(2).padStart(8, '0');
    }
    return binaryString;
  }
  
  readCompressedFile(buffer) {
    const view = new DataView(buffer);
    const metadataLength = view.getUint32(0);
    const metadataBuffer = buffer.slice(4, 4 + metadataLength);
    const metadataStr = new TextDecoder().decode(metadataBuffer);
    const metadata = JSON.parse(metadataStr);
    
    const dataBuffer = buffer.slice(4 + metadataLength);
    const dataBytes = new Uint8Array(dataBuffer);
    const encodedText = this.uint8ArrayToBinaryString(dataBytes);
    
    return { encodedText, metadata };
  }
  
}