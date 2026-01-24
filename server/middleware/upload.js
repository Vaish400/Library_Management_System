const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const filesDir = path.join(uploadsDir, 'books');

[uploadsDir, imagesDir, filesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for book images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for book files (PDFs, etc.)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, filesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// File filter for book files
const bookFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|epub|mobi|txt|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only book files (pdf, epub, mobi, txt, doc, docx) are allowed!'));
  }
};

// Combined storage that handles both images and book files
const combinedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'bookFile') {
      cb(null, filesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Combined file filter
const combinedFileFilter = (req, file, cb) => {
  // Allow requests without files (files are optional)
  if (!file) {
    return cb(null, true);
  }

  if (file.fieldname === 'image') {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype && allowedTypes.test(file.mimetype);
    
    // More lenient check - allow if extension matches even if mimetype is missing
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  } else if (file.fieldname === 'bookFile') {
    const allowedTypes = /pdf|epub|mobi|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype && allowedTypes.test(file.mimetype);
    
    // More lenient check - allow if extension matches even if mimetype is missing
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only book files (pdf, epub, mobi, txt, doc, docx) are allowed!'));
    }
  } else {
    // Allow unknown field names (they'll just be ignored)
    cb(null, true);
  }
};

// Upload middleware for both images and book files
const uploadFiles = multer({
  storage: combinedStorage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB limit for book files
    files: 2 // Max 2 files (image + bookFile)
  },
  fileFilter: combinedFileFilter
});

// Upload middleware for images only
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter
});

// Upload middleware for book files only
const uploadBookFile = multer({
  storage: fileStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: bookFileFilter
});

module.exports = {
  uploadImage,
  uploadBookFile,
  uploadFiles
};
