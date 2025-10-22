class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

class HuffmanCoding {
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
    this.generateCodes(root);

    // Encode text
    let encodedText = '';
    for (let char of text) {
      encodedText += this.codes[char];
    }

    return {
      encodedText,
      codes: this.codes,
      originalLength: text.length,
      encodedLength: encodedText.length
    };
  }

  // Decompress encoded text
  decompress(encodedText, codes) {
    this.reverseMapping = {};
    for (let [char, code] of Object.entries(codes)) {
      this.reverseMapping[code] = char;
    }

    let currentCode = '';
    let decodedText = '';

    for (let bit of encodedText) {
      currentCode += bit;
      if (this.reverseMapping[currentCode]) {
        decodedText += this.reverseMapping[currentCode];
        currentCode = '';
      }
    }

    return decodedText;
  }

  // Convert binary string to buffer
  binaryStringToBuffer(binaryString) {
    // Calculate padding needed to make the binary string length a multiple of 8
    const padding = (8 - (binaryString.length % 8)) % 8;
    const paddedBinary = binaryString + '0'.repeat(padding);
    
    // Convert each 8-bit chunk to a byte
    const buffer = Buffer.alloc(Math.ceil(paddedBinary.length / 8));
    for (let i = 0; i < paddedBinary.length; i += 8) {
      const byte = paddedBinary.slice(i, i + 8);
      buffer[i / 8] = parseInt(byte, 2);
    }
    
    return { buffer, padding };
  }

  // Convert buffer to binary string
  bufferToBinaryString(buffer, padding) {
    let binaryString = '';
    
    // Convert each byte to its binary representation
    for (let i = 0; i < buffer.length; i++) {
      binaryString += buffer[i].toString(2).padStart(8, '0');
    }
    
    // Remove padding bits from the end
    if (padding > 0 && binaryString.length >= padding) {
      binaryString = binaryString.slice(0, -padding);
    }
    
    return binaryString;
  }
}

module.exports = HuffmanCoding;
