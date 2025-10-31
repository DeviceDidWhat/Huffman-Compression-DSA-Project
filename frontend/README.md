# Huffman Compression - Frontend

React-based frontend for the Huffman Compression web application. Compress and decompress text files using the Huffman coding algorithm.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **ESLint** - Code linting

## Features

- File drag-and-drop interface
- Real-time compression progress
- Compression statistics display
- Fully responsive design (mobile & desktop)
- History tracking

## Development

The frontend runs on `http://localhost:5173` by default. It connects to the backend API at `http://localhost:5000`.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── components/          # React components
│   ├── AppHeader.jsx
│   ├── FileDropZone.jsx
│   ├── FileInfoDisplay.jsx
│   └── StatusCard.jsx
├── lib/
│   ├── huffman.js      # Huffman algorithm implementation
│   └── utils.js        # Helper functions
├── App.jsx             # Main application
└── main.jsx            # Entry point
```
