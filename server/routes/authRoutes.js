const express = require('express');
const router = express.Router();
const {
  register,
  requestOTP,
  verifyOTP,
  getCurrentUser,
  getAllUsers,
  updateUserRole
} = require('../controllers/authController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', authenticate, getCurrentUser);
router.get('/users', authenticate, authorizeAdmin, getAllUsers);
// Update role: works if user is admin OR no admins exist (for initial setup)
router.put('/users/role', authenticate, updateUserRole);

module.exports = router;
