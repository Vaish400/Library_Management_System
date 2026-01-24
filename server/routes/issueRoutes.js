const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getMyIssuedBooks,
  getAllIssuedBooks
} = require('../controllers/issueController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/issue', authenticate, issueBook);
router.post('/return', authenticate, returnBook);
router.get('/my-books', authenticate, getMyIssuedBooks);
router.get('/all', authenticate, authorizeAdmin, getAllIssuedBooks);

module.exports = router;
