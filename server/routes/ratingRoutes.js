const express = require('express');
const router = express.Router();
const {
  addRating,
  getUserRating,
  getBookRatings
} = require('../controllers/ratingController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, addRating);
router.get('/book/:bookId', getBookRatings);
router.get('/book/:bookId/user', authenticate, getUserRating);

module.exports = router;
