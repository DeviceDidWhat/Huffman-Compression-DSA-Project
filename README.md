# 🗜️ Huffman Compression Web App

A full-stack web application that implements Huffman coding algorithm for text file compression and decompression. Built with React, Node.js, and Express.

## 🌟 Features

- **Text File Compression**: Compress .txt files using Huffman coding algorithm
- **File Decompression**: Decompress .huff files back to their original content
- **Real-time Progress**: Visual feedback during compression/decompression
- **Compression History**: Track your file compression history
- **Drag & Drop**: Easy file upload interface
- **Compression Stats**: View compression ratio and file size details
- **Dark Mode Support**: Comfortable viewing in any lighting condition

## 🛠️ Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Modern ES6+ JavaScript

### Backend
- Node.js
- Express
- Morgan (logging)
- CORS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeviceDidWhat/Huffman-Compression-DSA-Project.git
   cd Huffman-Compression-DSA-Project
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the Backend Server**
   ```bash
   cd ../backend
   npm start
   # Server will start on http://localhost:5000
   ```

5. **Start the Frontend Development Server**
   ```bash
   cd ../frontend
   npm run dev
   # Vite dev server will start on http://localhost:5173
   ```

## 💻 Usage

1. **Compressing a File**
   - Open the web app in your browser
   - Drag and drop a .txt file or click to browse
   - Click the "Compress" button
   - Download the compressed .huff file

2. **Decompressing a File**
   - Switch to "Decompress" mode
   - Upload a .huff file
   - Click the "Decompress" button
   - Download the original text file

## 🔧 Project Structure

```
project/
├── backend/
│   ├── controllers/
│   │   └── compressionController.js
│   ├── middlewares/
│   │   └── upload.js
│   ├── routes/
│   │   └── compression.js
│   ├── utils/
│   │   └── huffman.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppHeader.jsx
│   │   │   ├── FileDropZone.jsx
│   │   │   ├── FileInfoDisplay.jsx
│   │   │   └── StatusCard.jsx
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
```

## 🧮 How It Works

The application uses the Huffman coding algorithm for compression:

1. **Compression Process**:
   - Analyzes character frequencies in the input text
   - Builds a Huffman tree based on frequencies
   - Generates binary codes for each character
   - Encodes the text using these codes
   - Saves the compressed data with metadata

2. **Decompression Process**:
   - Reads the metadata from the compressed file
   - Reconstructs the Huffman codes
   - Decodes the binary data back to text
   - Restores the original file content

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

DeviceDidWhat - GitHub: [@DeviceDidWhat](https://github.com/DeviceDidWhat)

Project Link: [https://github.com/DeviceDidWhat/Huffman-Compression-DSA-Project](https://github.com/DeviceDidWhat/Huffman-Compression-DSA-Project)
