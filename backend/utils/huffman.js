class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

// Min-heap implementation for efficient Huffman tree building
class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(node) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].freq >= this.heap[parentIndex].freq) break;

      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild].freq < this.heap[smallest].freq) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].freq < this.heap[smallest].freq) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  size() {
    return this.heap.length;
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
    const heap = new MinHeap();

    // Insert all characters into the min-heap
    for (const [char, freq] of Object.entries(frequency)) {
      heap.insert(new HuffmanNode(char, freq));
    }

    // Build the tree by merging nodes
    while (heap.size() > 1) {
      const left = heap.extractMin();
      const right = heap.extractMin();

      const merged = new HuffmanNode(null, left.freq + right.freq);
      merged.left = left;
      merged.right = right;

      heap.insert(merged);
    }

    return heap.extractMin();
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