const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  respondToRequest,
  getRequestStats
} = require('../controllers/requestController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Student routes
router.post('/', authenticate, createRequest);
router.get('/my-requests', authenticate, getMyRequests);

// Admin routes
router.get('/all', authenticate, authorizeAdmin, getAllRequests);
router.get('/stats', authenticate, authorizeAdmin, getRequestStats);
router.put('/:requestId/respond', authenticate, authorizeAdmin, respondToRequest);

module.exports = router;
