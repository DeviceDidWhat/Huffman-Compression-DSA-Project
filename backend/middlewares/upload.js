const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads'); // Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({ // Configure storage
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => { // File filter for text and image files
  const allowedMimes = [
    'text/plain',
    'application/octet-stream',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  const allowedExtensions = ['.txt', '.huff', '.png', '.jpg', '.jpeg', '.huffimg'];
  const hasAllowedExtension = allowedExtensions.some(ext =>
    file.originalname.toLowerCase().endsWith(ext)
  );

  if (allowedMimes.includes(file.mimetype) || hasAllowedExtension) {
    cb(null, true);
  } else {
    cb(new Error('Only .txt, .huff, .png, .jpg, .jpeg, and .huffimg files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

module.exports = upload;