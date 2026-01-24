const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  downloadBookFile
} = require('../controllers/bookController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const { uploadFiles } = require('../middleware/upload');

// Get all books (public)
router.get('/', getAllBooks);

// Download book file (authenticated; uses JWT via axios)
router.get('/:id/download', authenticate, downloadBookFile);

// Get book by ID (public)
router.get('/:id', getBookById);

// Add book (admin only)
router.post('/', authenticate, authorizeAdmin, uploadFiles.fields([
  { name: 'image', maxCount: 1 },
  { name: 'bookFile', maxCount: 1 }
]), (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}, addBook);

// Update book (admin only)
router.put('/:id', authenticate, authorizeAdmin, uploadFiles.fields([
  { name: 'image', maxCount: 1 },
  { name: 'bookFile', maxCount: 1 }
]), (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}, updateBook);

// Delete book (admin only)
router.delete('/:id', authenticate, authorizeAdmin, deleteBook);

module.exports = router;
