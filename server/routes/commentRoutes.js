const express = require('express');
const router = express.Router();
const {
  addComment,
  getBookComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, addComment);
router.get('/book/:bookId', getBookComments);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

module.exports = router;
