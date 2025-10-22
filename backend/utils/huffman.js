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
    const bytes = [];
    const padding = (8 - (binaryString.length % 8)) % 8;
    binaryString = binaryString + '0'.repeat(padding);

    for (let i = 0; i < binaryString.length; i += 8) {
      const byte = binaryString.substr(i, 8);
      bytes.push(parseInt(byte, 2));
    }

    return { buffer: Buffer.from(bytes), padding };
  }

  // Convert buffer to binary string
  bufferToBinaryString(buffer, padding) {
    let binaryString = '';
    for (let byte of buffer) {
      binaryString += byte.toString(2).padStart(8, '0');
    }
    // Remove padding
    return binaryString.slice(0, binaryString.length - padding);
  }
}

module.exports = HuffmanCoding;
