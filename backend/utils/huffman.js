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

  buildFrequencyMap(text) {
    const frequency = {};
    for (let char of text) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    return frequency;
  }

  buildHuffmanTree(frequency) {
    const heap = Object.entries(frequency).map(([char, freq]) => 
      new HuffmanNode(char, freq)
    );
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

  compress(text) {
    if (!text || text.length === 0) {
      throw new Error('Text is empty');
    }
    const frequency = this.buildFrequencyMap(text);
    const root = this.buildHuffmanTree(frequency);
    this.generateCodes(root);
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
  binaryStringToBuffer(binaryString) {
    const padding = (8 - (binaryString.length % 8)) % 8; // Calculate padding needed to make the binary string length a multiple of 8
    const paddedBinary = binaryString + '0'.repeat(padding);
    const buffer = Buffer.alloc(Math.ceil(paddedBinary.length / 8)); // Convert each 8-bit chunk to a byte
    for (let i = 0; i < paddedBinary.length; i += 8) {
      const byte = paddedBinary.slice(i, i + 8);
      buffer[i / 8] = parseInt(byte, 2);
    }
    
    return { buffer, padding };
  }

  bufferToBinaryString(buffer, padding) { // Convert buffer to binary string
    let binaryString = '';
       
    for (let i = 0; i < buffer.length; i++) { // Convert each byte to its binary representation
      binaryString += buffer[i].toString(2).padStart(8, '0');
    }  
    if (padding > 0 && binaryString.length >= padding) { // Remove padding bits from the end
      binaryString = binaryString.slice(0, -padding);
    }
    
    return binaryString;
  }
}

module.exports = HuffmanCoding;