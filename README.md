# Huffman Compression

A web application for compressing and decompressing text files using the Huffman coding algorithm. Built with React and Vite.

## About

Huffman coding is a lossless data compression algorithm that assigns variable-length codes to characters based on their frequency. More frequent characters get shorter codes, reducing overall file size.

This application provides a simple interface to:
- Compress text files (.txt) to .huff format
- Decompress .huff files back to text
- View compression statistics and file size reductions

## Quick Start

### Prerequisites
- Node.js 14+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/DeviceDidWhat/Huffman-Compression-DSA-Project.git
cd Huffman-Compression-DSA-Project

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Backend (Optional)

The project includes a Node.js/Express backend (currently unused by frontend):

```bash
# Install backend dependencies
cd ../backend
npm install

# Start backend server
npm start
```

Backend runs on http://localhost:5000

## Usage

1. **Compress a file**
   - Click "Compress" mode
   - Drag & drop a .txt file or click to browse
   - Click "Compress" button
   - Download the resulting .huff file

2. **Decompress a file**
   - Click "Decompress" mode
   - Upload a .huff file
   - Click "Decompress" button
   - Download the restored text file

## How It Works

### Compression
1. Read input text and count character frequencies
2. Build a Huffman tree using priority queue (min-heap)
3. Generate binary codes for each character
4. Encode text using these codes
5. Save encoded data with tree metadata

### Decompression
1. Read compressed file and extract metadata
2. Reconstruct Huffman tree from serialized data
3. Decode binary stream back to original text
4. Restore file with original name

## Project Structure

```
Huffman-Compression-DSA-Project/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Huffman algorithm + utils
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
└── backend/               # Express API (optional)
    ├── controllers/       # Compression endpoints
    ├── routes/            # API routes
    ├── middlewares/       # File upload handling
    ├── utils/             # Server-side Huffman
    └── server.js
```

## Development

### Frontend Tech Stack
- React 19 - UI library
- Vite - Build tool and dev server
- Tailwind CSS - Styling
- Vanilla JavaScript - No TypeScript

### Running Tests

Currently no automated tests. Run linter:

```bash
cd frontend
npm run lint
```

### Building for Production

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## Current Status

- Frontend: Fully functional with client-side compression
- Backend: Implemented but not connected to frontend
- Future work: Integrate backend API, add tests, improve compression speed

## License

ISC

## Links

Repository: https://github.com/DeviceDidWhat/Huffman-Compression-DSA-Project
