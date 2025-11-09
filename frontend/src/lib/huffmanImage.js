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

      if (leftChild < this.heap.length && this.heap[leftChild].frequency < this.heap[smallest].frequency)
        smallest = leftChild;
      if (rightChild < this.heap.length && this.heap[rightChild].frequency < this.heap[smallest].frequency)
        smallest = rightChild;

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
            data: imageData.data, // RGBA
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  quantizeColor(value) {
    const levels = 64;
    const step = 256 / levels;
    return Math.floor(value / step) * step;
  }

  quantizeImage(imageData) {
    const quantized = new Uint8Array(imageData.length);
    for (let i = 0; i < imageData.length; i += 4) {
      quantized[i] = this.quantizeColor(imageData[i]);
      quantized[i + 1] = this.quantizeColor(imageData[i + 1]);
      quantized[i + 2] = this.quantizeColor(imageData[i + 2]);
      quantized[i + 3] = imageData[i + 3];
    }
    return quantized;
  }

  deltaEncode(channelData) {
    if (channelData.length === 0) return [];
    const deltas = [channelData[0]];
    for (let i = 1; i < channelData.length; i++) {
      const delta = channelData[i] - channelData[i - 1];
      deltas.push(delta + 128);
    }
    return deltas;
  }

  deltaReverse(deltas) {
    if (deltas.length === 0) return [];
    const values = [deltas[0]];
    for (let i = 1; i < deltas.length; i++) {
      const delta = deltas[i] - 128;
      values.push(values[i - 1] + delta);
    }
    return values;
  }

  buildFrequencyMap(data) {
    const freqMap = new Map();
    for (const value of data) freqMap.set(value, (freqMap.get(value) || 0) + 1);
    return freqMap;
  }

  buildHuffmanTree(freqMap) {
    if (freqMap.size === 0) return null;
    const heap = new ImageMinHeap();
    for (const [value, freq] of freqMap.entries()) heap.insert(new HuffmanNode(value, freq));
    while (heap.size() > 1) {
      const left = heap.extractMin();
      const right = heap.extractMin();
      heap.insert(new HuffmanNode(null, left.frequency + right.frequency, left, right));
    }
    return heap.extractMin();
  }

  generateCodes(node, code = "", codes = {}) {
    if (!node) return codes;
    if (node.value !== null) {
      codes[node.value] = code || "0";
      return codes;
    }
    this.generateCodes(node.left, code + "0", codes);
    this.generateCodes(node.right, code + "1", codes);
    return codes;
  }

  serializeTree(node) {
    if (!node) return [];
    if (node.value !== null) return [{ leaf: true, value: node.value }];
    return [{ leaf: false }, ...this.serializeTree(node.left), ...this.serializeTree(node.right)];
  }

  deserializeTree(serialized) {
    let index = 0;
    const buildNode = () => {
      if (index >= serialized.length) return null;
      const current = serialized[index++];
      if (current.leaf) return new HuffmanNode(current.value, 0);
      const node = new HuffmanNode(null, 0);
      node.left = buildNode();
      node.right = buildNode();
      return node;
    };
    return buildNode();
  }

  encodeData(data, codes) {
    let bitString = "";
    for (const value of data) bitString += codes[value];
    return bitString;
  }

  bitStringToBytes(bitString) {
    const padding = (8 - (bitString.length % 8)) % 8;
    bitString += "0".repeat(padding);
    const bytes = new Uint8Array(bitString.length / 8);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bitString.substring(i * 8, i * 8 + 8), 2);
    }
    return { bytes, padding };
  }

  bytesToBitString(bytes, padding) {
    let bitString = "";
    for (const byte of bytes) bitString += byte.toString(2).padStart(8, "0");
    return bitString.slice(0, -padding || bitString.length);
  }

  decodeData(bitString, tree, length) {
    const decoded = [];
    let current = tree;
    if (tree.value !== null) return new Array(length).fill(tree.value);
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

  async compress(file) {
    const uploadedFileSize = file.size;
    const imageData = await this.loadImage(file);
    const { width, height, data } = imageData;

    const quantized = this.quantizeImage(data);

    const channels = { r: [], g: [], b: [], a: [] };
    for (let i = 0; i < quantized.length; i += 4) {
      channels.r.push(quantized[i]);
      channels.g.push(quantized[i + 1]);
      channels.b.push(quantized[i + 2]);
      channels.a.push(quantized[i + 3]);
    }

    const processChannel = (deltaData) => {
      const freqMap = this.buildFrequencyMap(deltaData);
      const tree = this.buildHuffmanTree(freqMap);
      const codes = this.generateCodes(tree);
      const encoded = this.encodeData(deltaData, codes);
      const { bytes, padding } = this.bitStringToBytes(encoded);
      const serializedTree = this.serializeTree(tree);
      return { bytes, padding, tree: serializedTree };
    };

    const deltaR = this.deltaEncode(channels.r);
    const deltaG = this.deltaEncode(channels.g);
    const deltaB = this.deltaEncode(channels.b);
    const deltaA = this.deltaEncode(channels.a);

    const rChannel = processChannel(deltaR);
    const gChannel = processChannel(deltaG);
    const bChannel = processChannel(deltaB);
    const aChannel = processChannel(deltaA);

    const fileExtMatch = file.name.match(/\.(png|jpg|jpeg|bmp|tiff|tif|webp)$/i);
    const originalExtension = fileExtMatch ? fileExtMatch[1].toLowerCase() : "png";

    const metadata = {
      magic: "HUFFIMG",
      version: 1,
      width,
      height,
      channels: 4,
      originalName: file.name.replace(/\.(png|jpg|jpeg|bmp|tiff|tif|webp)$/i, ""),
      originalExtension,
      originalFileSize: uploadedFileSize,
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
      rByteLength: rChannel.bytes.length,
      gByteLength: gChannel.bytes.length,
      bByteLength: bChannel.bytes.length,
      aByteLength: aChannel.bytes.length,
    };

    const metadataJson = JSON.stringify(metadata);
    const metadataBytes = new TextEncoder().encode(metadataJson);
    const metadataLength = metadataBytes.length;

    const totalLength =
      4 + metadataLength +
      rChannel.bytes.length + gChannel.bytes.length +
      bChannel.bytes.length + aChannel.bytes.length;

    const result = new Uint8Array(totalLength);
    let offset = 0;
    new DataView(result.buffer).setUint32(offset, metadataLength, true);
    offset += 4;
    result.set(metadataBytes, offset);
    offset += metadataLength;
    result.set(rChannel.bytes, offset);
    offset += rChannel.bytes.length;
    result.set(gChannel.bytes, offset);
    offset += gChannel.bytes.length;
    result.set(bChannel.bytes, offset);
    offset += bChannel.bytes.length;
    result.set(aChannel.bytes, offset);

    const originalSize = uploadedFileSize;
    const compressedSize = result.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

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

  async decompress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const metadataLength = new DataView(data.buffer).getUint32(0, true);
          const metadataBytes = data.slice(4, 4 + metadataLength);
          const metadataJson = new TextDecoder().decode(metadataBytes);
          const metadata = JSON.parse(metadataJson);

          if (metadata.magic !== "HUFFIMG") throw new Error("Invalid .huffimg file format");
          if (metadata.version !== 1) throw new Error(`Unsupported file version: ${metadata.version}`);

          const offset = 4 + metadataLength;
          const remainingData = data.slice(offset);
          const totalBytes =
            metadata.rByteLength +
            metadata.gByteLength +
            metadata.bByteLength +
            metadata.aByteLength;

          if (remainingData.length < totalBytes)
            throw new Error(`Corrupted file: expected ${totalBytes} bytes, got ${remainingData.length}`);

          const rBytes = remainingData.slice(0, metadata.rByteLength);
          const gBytes = remainingData.slice(metadata.rByteLength, metadata.rByteLength + metadata.gByteLength);
          const bBytes = remainingData.slice(metadata.rByteLength + metadata.gByteLength, metadata.rByteLength + metadata.gByteLength + metadata.bByteLength);
          const aBytes = remainingData.slice(metadata.rByteLength + metadata.gByteLength + metadata.bByteLength);

          const rTree = this.deserializeTree(metadata.rTree);
          const gTree = this.deserializeTree(metadata.gTree);
          const bTree = this.deserializeTree(metadata.bTree);
          const aTree = this.deserializeTree(metadata.aTree);

          const rBits = this.bytesToBitString(rBytes, metadata.rPadding);
          const gBits = this.bytesToBitString(gBytes, metadata.gPadding);
          const bBits = this.bytesToBitString(bBytes, metadata.bPadding);
          const aBits = this.bytesToBitString(aBytes, metadata.aPadding);

          const deltaR = this.decodeData(rBits, rTree, metadata.rLength);
          const deltaG = this.decodeData(gBits, gTree, metadata.gLength);
          const deltaB = this.decodeData(bBits, bTree, metadata.bLength);
          const deltaA = this.decodeData(aBits, aTree, metadata.aLength);

          const channelR = this.deltaReverse(deltaR);
          const channelG = this.deltaReverse(deltaG);
          const channelB = this.deltaReverse(deltaB);
          const channelA = this.deltaReverse(deltaA);

          const expectedPixelCount = metadata.width * metadata.height;
          if (
            channelR.length !== expectedPixelCount ||
            channelG.length !== expectedPixelCount ||
            channelB.length !== expectedPixelCount ||
            channelA.length !== expectedPixelCount
          ) {
            throw new Error(
              `Channel length mismatch: expected ${expectedPixelCount}, got R:${channelR.length}, G:${channelG.length}, B:${channelB.length}, A:${channelA.length}`
            );
          }

          const imageData = new Uint8ClampedArray(metadata.width * metadata.height * 4);
          for (let i = 0; i < expectedPixelCount; i++) {
            imageData[i * 4] = Math.max(0, Math.min(255, channelR[i]));
            imageData[i * 4 + 1] = Math.max(0, Math.min(255, channelG[i]));
            imageData[i * 4 + 2] = Math.max(0, Math.min(255, channelB[i]));
            imageData[i * 4 + 3] = Math.max(0, Math.min(255, channelA[i]));
          }

          const canvas = document.createElement("canvas");
          canvas.width = metadata.width;
          canvas.height = metadata.height;
          const ctx = canvas.getContext("2d");
          ctx.putImageData(new ImageData(imageData, metadata.width, metadata.height), 0, 0);

          const outputExtension = metadata.originalExtension || "png";
          const extensionToMimeType = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            bmp: "image/bmp",
            tiff: "image/tiff",
            tif: "image/tiff",
            webp: "image/webp",
          };
          const mimeType = extensionToMimeType[outputExtension] || "image/png";
          const quality = ["jpg", "jpeg", "webp"].includes(outputExtension) ? 0.95 : undefined;

          canvas.toBlob(
            (blob) => {
              resolve({
                blob,
                filename: `${metadata.originalName}_decompressed.${outputExtension}`,
                width: metadata.width,
                height: metadata.height,
                originalSize: file.size,
                decompressedSize: blob.size,
                imageUrl: URL.createObjectURL(blob),
                originalFileSize: metadata.originalFileSize,
              });
            },
            mimeType,
            quality
          );
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
