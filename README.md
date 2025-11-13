# Huffman Compression

A feature-rich web application implementing the Huffman coding algorithm for both text and image compression. Built with React, Vite, and Tailwind CSS.

## Overview

Huffman coding is a lossless data compression algorithm that assigns variable-length binary codes to characters based on their frequency. This application demonstrates the algorithm through an interactive interface with both text and image compression capabilities.

## Features

### Core Compression

- **Text Compression** - Compress .txt files to .huff format (lossless, 30-60% reduction typical)
- **Image Compression** - Compress .png/.jpg files to .huffimg format (lossy with color quantization)
- **Decompression** - Restore original files from .huff and .huffimg formats
- **Client-side Processing** - All compression runs in browser, no server required
- **Large File Support** - Handle files up to 100MB

### Visualization & Analysis

- **Huffman Code Table** - Interactive visualization showing:
  - Character-to-binary code mappings
  - Code lengths and compression savings per character
  - Search and sort functionality
  - Special character handling (space, newline, tab)
  - Statistics (unique characters, average code length)
- **Compression Statistics** - Real-time display of:
  - Original and compressed file sizes
  - Space saved percentage
  - Visual compression ratio bar
  - Image dimensions (for image files)
- **Compression History** - Track last 10 compressions in browser localStorage

### User Interface

- **Drag-and-drop Upload** - Intuitive file upload with visual feedback
- **Dark/Light Theme** - Toggle with system preference detection
- **Progress Tracking** - Visual progress bar during compression
- **Status Indicators** - Clear status messages (idle, processing, success, error)
- **Image Preview** - View decompressed images in browser
- **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- Node.js 14+ and npm

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/xevrion/Huffman-Compression-DSA-Project.git
cd Huffman-Compression-DSA-Project

# Install and run
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Compressing Text Files

1. Select **"Compress"** mode
2. Select **"Text"** file type
3. Drag and drop a .txt file or click to browse
4. Click **"Compress"** button
5. View the Huffman code table and compression statistics
6. Download the resulting .huff file

### Compressing Image Files

1. Select **"Compress"** mode
2. Select **"Image"** file type
3. Drag and drop a .png or .jpg file or click to browse
4. Click **"Compress"** button
5. View compression statistics
6. Download the resulting .huffimg file

### Decompressing Files

1. Select **"Decompress"** mode
2. Upload a .huff or .huffimg file
3. Click **"Decompress"** button
4. For images, preview the decompressed image in browser
5. Download the restored original file

## How It Works

### Text Compression Algorithm

1. **Frequency Analysis** - Count occurrences of each character
2. **Tree Construction** - Build Huffman tree using min-heap priority queue
3. **Code Generation** - Generate variable-length binary codes via tree traversal
4. **Encoding** - Replace characters with their Huffman codes
5. **Serialization** - Package compressed data with tree metadata

**File Format (.huff)**:
```
[4 bytes: metadata length as Uint32]
[N bytes: JSON metadata {tree, padding, originalName}]
[M bytes: compressed binary data as Uint8Array]
```

### Image Compression Algorithm

1. **Image Loading** - Extract RGBA pixel data from image file
2. **Color Quantization** - Reduce color depth from 8-bit (256 levels) to 6-bit (64 levels) per channel
3. **Delta Encoding** - Store pixel differences instead of absolute values
4. **Huffman Encoding** - Build separate Huffman trees for R, G, B, and Alpha channels
5. **Serialization** - Package compressed channel data with metadata

**File Format (.huffimg)**:
```
[4 bytes: metadata length as Uint32]
[JSON metadata {magic, version, width, height, channels, trees, padding, originalName}]
[Compressed R channel bytes]
[Compressed G channel bytes]
[Compressed B channel bytes]
[Compressed A channel bytes]
```

**Why Image Compression Works**:
- Color quantization provides controllable quality loss
- Delta encoding creates repetitive small values ideal for Huffman compression
- Per-channel trees optimize for different color distributions
- Most effective on images with limited color palettes (screenshots, diagrams, graphics)

### Decompression Process

1. **Parsing** - Extract metadata and compressed data from file
2. **Tree Reconstruction** - Rebuild Huffman tree(s) from serialized format
3. **Decoding** - Traverse tree using binary stream to restore original data
4. **Delta Reversal** - (Images only) Restore absolute pixel values from differences
5. **Output** - Return original file with restored name

## Project Structure

```
Huffman-Compression-DSA-Project/
├── frontend/                           # React application (client-side)
│   ├── src/
│   │   ├── components/                 # UI components
│   │   │   ├── AppHeader.jsx           # Header with title and theme toggle
│   │   │   ├── CodeTable.jsx           # Huffman code visualization table
│   │   │   ├── FileDropZone.jsx        # Drag-and-drop file upload
│   │   │   ├── FileInfoDisplay.jsx     # File stats and download
│   │   │   ├── StatusCard.jsx          # Progress and status display
│   │   │   └── ThemeToggleButton.jsx   # Dark/light theme toggle
│   │   ├── lib/                        # Core algorithm implementations
│   │   │   ├── huffman.js              # Text compression (HuffmanCompressor + MinHeap)
│   │   │   ├── huffmanImage.js         # Image compression (HuffmanImageCompressor)
│   │   │   └── utils.js                # File validation, formatting, history
│   │   ├── workers/
│   │   │   └── compression.worker.js   # Web Worker for async processing (not yet integrated)
│   │   ├── App.jsx                     # Main application container
│   │   └── main.jsx                    # Entry point
│   └── package.jsonc
├── LICENSE
└── README.md
```

## Technology Stack

- **React** 19.1.1 - UI library with modern hooks
- **Vite** 7.1.7 - Fast build tool and dev server
- **Tailwind CSS** 4.1.15 - Utility-first styling

**Browser APIs Used**:
- FileReader API - File reading
- Canvas API - Image processing
- Web Workers - Async processing (available, not yet integrated)
- localStorage - Compression history and theme preference

## Development

### Build Commands

```bash
cd frontend

npm run dev       # Start development server at http://localhost:5173
npm run build     # Build for production → dist/
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Architecture Highlights

- **Pure client-side** - No backend required, fully standalone
- **Synchronous processing** - May block UI on large files (>50MB)
- **Component-based** - React functional components with hooks
- **Theme system** - CSS custom properties with localStorage persistence
- **History tracking** - Last 10 compressions stored in browser
- **Responsive design** - Mobile-first Tailwind CSS approach

### Data Structures & Algorithms

- **Binary Tree** - Huffman tree structure
- **Min-Heap** - Priority queue for O(n log n) tree construction
- **Greedy Algorithm** - Huffman coding optimal prefix codes
- **Tree Traversal** - Pre-order for serialization, code generation
- **Bit Manipulation** - Binary encoding and decoding
- **Delta Encoding** - First-order difference encoding for images

## Performance

- **Text Compression**: Typically 30-60% size reduction on natural language text
- **Image Compression**: Varies based on image content (best on graphics with limited colors)
- **File Size Limit**: 100MB maximum
- **Processing Time**: O(n log n) complexity for tree building, linear for encoding/decoding

**Best Results**:
- Text: Repeated content, natural language, code files
- Images: Screenshots, diagrams, graphics with solid colors

**Poor Results**:
- Text: Random data, already compressed files, short files
- Images: Photos with gradients, already compressed JPEGs

## Supported File Formats

| Mode | Operation | Input | Output |
|------|-----------|-------|--------|
| Compress | Text | `.txt` | `.huff` |
| Compress | Image | `.png`, `.jpg`, `.jpeg` | `.huffimg` |
| Decompress | Text | `.huff` | `.txt` |
| Decompress | Image | `.huffimg` | `.png` |

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Run linting (`npm run lint`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the [MIT LICENSE](LICENSE)

## Acknowledgments

This project was created as an educational demonstration of data structures and algorithms, specifically showcasing:
- Huffman coding algorithm
- Binary trees and heaps
- Greedy algorithms
- Bit manipulation techniques
- Image processing fundamentals

Built as part of a DSA (Data Structures and Algorithms) project.
