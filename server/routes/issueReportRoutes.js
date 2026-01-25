const express = require('express');
const router = express.Router();
const {
  createIssue,
  getAllIssues,
  getMyIssues,
  respondToIssue,
  getIssueStats
} = require('../controllers/issueReportController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Student routes
router.post('/', authenticate, createIssue);
router.get('/my-issues', authenticate, getMyIssues);

// Admin routes
router.get('/all', authenticate, authorizeAdmin, getAllIssues);
router.get('/stats', authenticate, authorizeAdmin, getIssueStats);
router.put('/:issueId/respond', authenticate, authorizeAdmin, respondToIssue);

module.exports = router;
