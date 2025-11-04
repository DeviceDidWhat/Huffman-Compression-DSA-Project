// Huffman Image Compressor
// Implements lossy image compression using color quantization + delta encoding + Huffman coding

class HuffmanNode {
  constructor(value, frequency, left = null, right = null) {
    this.value = value;
    this.frequency = frequency;
    this.left = left;
    this.right = right;
  }
}

// Min-heap implementation for efficient Huffman tree building
class ImageMinHeap {
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
      if (this.heap[index].frequency >= this.heap[parentIndex].frequency) break;

      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild].frequency < this.heap[smallest].frequency) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].frequency < this.heap[smallest].frequency) {
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

class HuffmanImageCompressor {
  constructor() {
    this.codes = {};
  }

  // Load image from file and extract pixel data
  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          resolve({
            width: canvas.width,
            height: canvas.height,
            data: imageData.data, // RGBA Uint8ClampedArray
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Color quantization - reduce color depth to 64 levels per channel (6-bit)
  // WARNING: This is LOSSY compression!
  // Reduces from 256 levels (8-bit) to 64 levels (6-bit) per channel
  // Color space: 16,777,216 colors (24-bit) -> 262,144 colors (18-bit)
  // This results in visible quality loss but significantly better compression
  quantizeColor(value) {
    const levels = 64;
    const step = 256 / levels;
    return Math.floor(value / step) * step;
  }

  // Apply color quantization to entire image
  quantizeImage(imageData) {
    const quantized = new Uint8Array(imageData.length);
    for (let i = 0; i < imageData.length; i += 4) {
      quantized[i] = this.quantizeColor(imageData[i]); // R
      quantized[i + 1] = this.quantizeColor(imageData[i + 1]); // G
      quantized[i + 2] = this.quantizeColor(imageData[i + 2]); // B
      quantized[i + 3] = imageData[i + 3]; // Alpha - keep unchanged
    }
    return quantized;
  }

  // Delta encoding - store differences between adjacent pixels
  deltaEncode(channelData) {
    if (channelData.length === 0) return [];

    const deltas = [channelData[0]]; // First value stored as-is
    for (let i = 1; i < channelData.length; i++) {
      // Store difference from previous pixel, offset by 128 to handle negatives
      const delta = channelData[i] - channelData[i - 1];
      deltas.push(delta + 128); // Offset to make all values 0-255
    }
    return deltas;
  }

  // Reverse delta encoding
  deltaReverse(deltas) {
    if (deltas.length === 0) return [];

    const values = [deltas[0]];
    for (let i = 1; i < deltas.length; i++) {
      const delta = deltas[i] - 128; // Remove offset
      values.push(values[i - 1] + delta);
    }
    return values;
  }

  // Build frequency map for a channel
  buildFrequencyMap(data) {
    const freqMap = new Map();
    for (const value of data) {
      freqMap.set(value, (freqMap.get(value) || 0) + 1);
    }
    return freqMap;
  }

  // Build Huffman tree from frequency map with proper min-heap
  buildHuffmanTree(freqMap) {
    if (freqMap.size === 0) return null;
    if (freqMap.size === 1) {
      const [value, freq] = freqMap.entries().next().value;
      return new HuffmanNode(value, freq);
    }

    // Use a proper min-heap for O(n log n) complexity
    const heap = new ImageMinHeap();

    // Insert all values into the heap
    for (const [value, freq] of freqMap.entries()) {
      heap.insert(new HuffmanNode(value, freq));
    }

    // Build the tree by merging nodes
    while (heap.size() > 1) {
      const left = heap.extractMin();
      const right = heap.extractMin();
      const parent = new HuffmanNode(
        null,
        left.frequency + right.frequency,
        left,
        right
      );
      heap.insert(parent);
    }

    return heap.extractMin();
  }

  // Generate Huffman codes from tree
  generateCodes(node, code = "", codes = {}) {
    if (!node) return codes;

    if (node.value !== null) {
      codes[node.value] = code || "0"; // Handle single-node tree
      return codes;
    }

    this.generateCodes(node.left, code + "0", codes);
    this.generateCodes(node.right, code + "1", codes);
    return codes;
  }

  // Serialize tree for storage (pre-order traversal)
  serializeTree(node) {
    if (!node) return [];
    if (node.value !== null) {
      return [{ leaf: true, value: node.value }];
    }
    return [
      { leaf: false },
      ...this.serializeTree(node.left),
      ...this.serializeTree(node.right),
    ];
  }

  // Deserialize tree from array
  deserializeTree(serialized) {
    if (serialized.length === 0) return null;

    const stack = [];
    const root = serialized[0];

    if (serialized.length === 1 && root.leaf) {
      return new HuffmanNode(root.value, 0);
    }

    let index = 0;
    const buildNode = () => {
      if (index >= serialized.length) return null;

      const current = serialized[index++];
      if (current.leaf) {
        return new HuffmanNode(current.value, 0);
      }

      const node = new HuffmanNode(null, 0);
      node.left = buildNode();
      node.right = buildNode();
      return node;
    };

    return buildNode();
  }

  // Encode data using Huffman codes
  encodeData(data, codes) {
    let bitString = "";
    for (const value of data) {
      bitString += codes[value];
    }
    return bitString;
  }

  // Convert bit string to Uint8Array
  bitStringToBytes(bitString) {
    const padding = (8 - (bitString.length % 8)) % 8;
    bitString += "0".repeat(padding);

    const bytes = new Uint8Array(bitString.length / 8);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bitString.substring(i * 8, i * 8 + 8), 2);
    }
    return { bytes, padding };
  }

  // Convert bytes back to bit string
  bytesToBitString(bytes, padding) {
    let bitString = "";
    for (const byte of bytes) {
      bitString += byte.toString(2).padStart(8, "0");
    }
    return bitString.slice(0, -padding || bitString.length);
  }

  // Decode bit string using Huffman tree
  decodeData(bitString, tree, length) {
    const decoded = [];
    let current = tree;

    // Handle single-node tree
    if (tree.value !== null) {
      return new Array(length).fill(tree.value);
    }

    for (const bit of bitString) {
      current = bit === "0" ? current.left : current.right;

      if (current.value !== null) {
        decoded.push(current.value);
        if (decoded.length === length) break;
        current = tree;
      }
    }

    return decoded;
  }

  // Main compression function
  async compress(file) {
    // Load image
    const imageData = await this.loadImage(file);
    const { width, height, data } = imageData;

    // Quantize colors
    const quantized = this.quantizeImage(data);

    // Separate into channels
    const channels = { r: [], g: [], b: [], a: [] };
    for (let i = 0; i < quantized.length; i += 4) {
      channels.r.push(quantized[i]);
      channels.g.push(quantized[i + 1]);
      channels.b.push(quantized[i + 2]);
      channels.a.push(quantized[i + 3]);
    }

    // Delta encode each channel
    const deltaR = this.deltaEncode(channels.r);
    const deltaG = this.deltaEncode(channels.g);
    const deltaB = this.deltaEncode(channels.b);
    const deltaA = this.deltaEncode(channels.a);

    // Build Huffman trees and codes for each channel
    const processChannel = (deltaData) => {
      const freqMap = this.buildFrequencyMap(deltaData);
      const tree = this.buildHuffmanTree(freqMap);
      const codes = this.generateCodes(tree);
      const encoded = this.encodeData(deltaData, codes);
      const { bytes, padding } = this.bitStringToBytes(encoded);
      const serializedTree = this.serializeTree(tree);

      return { bytes, padding, tree: serializedTree };
    };

    const rChannel = processChannel(deltaR);
    const gChannel = processChannel(deltaG);
    const bChannel = processChannel(deltaB);
    const aChannel = processChannel(deltaA);

    // Create metadata
    const metadata = {
      magic: "HUFFIMG",
      version: 1,
      width,
      height,
      channels: 4, // RGBA
      originalName: file.name.replace(/\.(png|jpg|jpeg)$/i, ""),
      rTree: rChannel.tree,
      gTree: gChannel.tree,
      bTree: bChannel.tree,
      aTree: aChannel.tree,
      rPadding: rChannel.padding,
      gPadding: gChannel.padding,
      bPadding: bChannel.padding,
      aPadding: aChannel.padding,
      rLength: deltaR.length,
      gLength: deltaG.length,
      bLength: deltaB.length,
      aLength: deltaA.length,
      // Add actual compressed byte lengths for proper decompression
      rByteLength: rChannel.bytes.length,
      gByteLength: gChannel.bytes.length,
      bByteLength: bChannel.bytes.length,
      aByteLength: aChannel.bytes.length,
    };

    const metadataJson = JSON.stringify(metadata);
    const metadataBytes = new TextEncoder().encode(metadataJson);
    const metadataLength = metadataBytes.length;

    // Create final file
    const totalLength =
      4 + // metadata length
      metadataLength +
      rChannel.bytes.length +
      gChannel.bytes.length +
      bChannel.bytes.length +
      aChannel.bytes.length;

    const result = new Uint8Array(totalLength);
    let offset = 0;

    // Write metadata length
    new DataView(result.buffer).setUint32(offset, metadataLength, true);
    offset += 4;

    // Write metadata
    result.set(metadataBytes, offset);
    offset += metadataLength;

    // Write compressed channel data
    result.set(rChannel.bytes, offset);
    offset += rChannel.bytes.length;
    result.set(gChannel.bytes, offset);
    offset += gChannel.bytes.length;
    result.set(bChannel.bytes, offset);
    offset += bChannel.bytes.length;
    result.set(aChannel.bytes, offset);

    // Calculate compression stats
    const originalSize = width * height * 4;
    const compressedSize = result.length;
    const compressionRatio = (
      (1 - compressedSize / originalSize) *
      100
    ).toFixed(2);

    return {
      data: result,
      filename: `${metadata.originalName}.huffimg`,
      originalSize,
      compressedSize,
      compressionRatio,
      width,
      height,
    };
  }

  // Main decompression function
  async decompress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);

          // Read metadata length
          const metadataLength = new DataView(data.buffer).getUint32(0, true);
          const metadataBytes = data.slice(4, 4 + metadataLength);
          const metadataJson = new TextDecoder().decode(metadataBytes);
          const metadata = JSON.parse(metadataJson);

          // Verify magic bytes
          if (metadata.magic !== "HUFFIMG") {
            throw new Error("Invalid .huffimg file format");
          }

          // Verify version
          if (metadata.version !== 1) {
            throw new Error(`Unsupported file version: ${metadata.version}`);
          }

          // Validate metadata has required byte length fields
          if (!metadata.rByteLength || !metadata.gByteLength ||
              !metadata.bByteLength || !metadata.aByteLength) {
            throw new Error("Invalid file format: missing byte length information. This file may have been created with an older version.");
          }

          // Extract compressed channel data using actual byte lengths from metadata
          let offset = 4 + metadataLength;
          const remainingData = data.slice(offset);

          // Use actual byte lengths from metadata instead of estimates
          const rByteLength = metadata.rByteLength;
          const gByteLength = metadata.gByteLength;
          const bByteLength = metadata.bByteLength;
          const aByteLength = metadata.aByteLength;

          // Validate we have enough data
          const expectedTotalBytes = rByteLength + gByteLength + bByteLength + aByteLength;
          if (remainingData.length < expectedTotalBytes) {
            throw new Error(`Corrupted file: expected ${expectedTotalBytes} bytes, got ${remainingData.length}`);
          }

          // Extract each channel's bytes
          const rBytesActual = remainingData.slice(0, rByteLength);
          const gBytesActual = remainingData.slice(
            rByteLength,
            rByteLength + gByteLength
          );
          const bBytesActual = remainingData.slice(
            rByteLength + gByteLength,
            rByteLength + gByteLength + bByteLength
          );
          const aBytesActual = remainingData.slice(
            rByteLength + gByteLength + bByteLength,
            rByteLength + gByteLength + bByteLength + aByteLength
          );

          // Reconstruct trees
          const rTree = this.deserializeTree(metadata.rTree);
          const gTree = this.deserializeTree(metadata.gTree);
          const bTree = this.deserializeTree(metadata.bTree);
          const aTree = this.deserializeTree(metadata.aTree);

          // Convert bytes to bit strings
          const rBitString = this.bytesToBitString(
            rBytesActual,
            metadata.rPadding
          );
          const gBitString = this.bytesToBitString(
            gBytesActual,
            metadata.gPadding
          );
          const bBitString = this.bytesToBitString(
            bBytesActual,
            metadata.bPadding
          );
          const aBitString = this.bytesToBitString(
            aBytesActual,
            metadata.aPadding
          );

          // Decode each channel
          const deltaR = this.decodeData(rBitString, rTree, metadata.rLength);
          const deltaG = this.decodeData(gBitString, gTree, metadata.gLength);
          const deltaB = this.decodeData(bBitString, bTree, metadata.bLength);
          const deltaA = this.decodeData(aBitString, aTree, metadata.aLength);

          // Reverse delta encoding
          const channelR = this.deltaReverse(deltaR);
          const channelG = this.deltaReverse(deltaG);
          const channelB = this.deltaReverse(deltaB);
          const channelA = this.deltaReverse(deltaA);

          // Validate channel lengths match expected pixel count
          const expectedPixelCount = metadata.width * metadata.height;
          if (channelR.length !== expectedPixelCount ||
              channelG.length !== expectedPixelCount ||
              channelB.length !== expectedPixelCount ||
              channelA.length !== expectedPixelCount) {
            throw new Error(
              `Channel length mismatch: expected ${expectedPixelCount} pixels, ` +
              `got R:${channelR.length}, G:${channelG.length}, B:${channelB.length}, A:${channelA.length}`
            );
          }

          // Reconstruct image data with value clamping
          const imageData = new Uint8ClampedArray(
            metadata.width * metadata.height * 4
          );
          for (let i = 0; i < channelR.length; i++) {
            // Clamp values to valid byte range (0-255)
            imageData[i * 4] = Math.max(0, Math.min(255, channelR[i]));
            imageData[i * 4 + 1] = Math.max(0, Math.min(255, channelG[i]));
            imageData[i * 4 + 2] = Math.max(0, Math.min(255, channelB[i]));
            imageData[i * 4 + 3] = Math.max(0, Math.min(255, channelA[i]));
          }

          // Create canvas and render image
          const canvas = document.createElement("canvas");
          canvas.width = metadata.width;
          canvas.height = metadata.height;
          const ctx = canvas.getContext("2d");
          const imgData = new ImageData(
            imageData,
            metadata.width,
            metadata.height
          );
          ctx.putImageData(imgData, 0, 0);

          // Convert to blob
          canvas.toBlob((blob) => {
            resolve({
              blob,
              filename: `${metadata.originalName}_decompressed.png`,
              width: metadata.width,
              height: metadata.height,
              originalSize: file.size,
              decompressedSize: blob.size,
              imageUrl: URL.createObjectURL(blob),
            });
          }, "image/png");
        } catch (error) {
          reject(new Error(`Decompression failed: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }
}

export default HuffmanImageCompressor;
