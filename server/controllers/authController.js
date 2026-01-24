const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../config/email');
const otpGenerator = require('otp-generator');
require('dotenv').config();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request OTP for login
const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    let users;
    try {
      [users] = await pool.execute(
        'SELECT id, name, email, role FROM users WHERE email = ?',
        [normalizedEmail]
      );
    } catch (dbError) {
      console.error('❌ Database error in requestOTP:', dbError.message);
      console.error('Database error code:', dbError.code);
      
      // Provide user-friendly error messages
      let errorMessage = 'Database connection error';
      if (dbError.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMessage = 'Database authentication failed. Please check your MySQL password in server/.env file.';
      } else if (dbError.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to MySQL server. Please ensure MySQL is running.';
      } else if (dbError.code === 'ER_BAD_DB_ERROR') {
        errorMessage = 'Database not found. Please create the library_db database.';
      }
      
      return res.status(500).json({ 
        message: errorMessage,
        error: dbError.message,
        code: dbError.code
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Generate OTP
    let otp;
    try {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
      });
    } catch (otpError) {
      return res.status(500).json({ 
        message: 'Failed to generate OTP', 
        error: otpError.message 
      });
    }

    // Store OTP with expiration (10 minutes)
    otpStore.set(normalizedEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send OTP email to the user's registered email address
    console.log(`📧 Sending OTP to user: ${user.name} (${user.email})`);
    const emailResult = await sendOTPEmail(user.email, otp, user.name);

    if (!emailResult.success) {
      // If email is not configured, return OTP in response for development
      if (emailResult.error && emailResult.error.includes('not configured')) {
        return res.status(200).json({
          message: `OTP: ${otp} (Email not configured - shown for development)`,
          email: user.email,
          otp: otp,
          warning: 'Email service not configured. OTP returned in response for development only.'
        });
      }
      // Return detailed error message but still provide OTP for development
      return res.status(200).json({
        message: `OTP: ${otp} (Email sending failed - shown for development)`,
        email: user.email,
        otp: otp,
        warning: emailResult.error || 'Email sending failed. OTP returned in response for development only.',
        emailError: emailResult.error
      });
    }

    res.json({
      message: `OTP sent successfully to ${user.email}`,
      email: user.email,
      userName: user.name
    });
  } catch (error) {
    // Log error to console for debugging
    console.error('❌ Error in requestOTP:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: 'Check server console for more details'
    });
  }
};

// Verify OTP and login
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if OTP exists and is valid
    const storedOTP = otpStore.get(normalizedEmail);

    if (!storedOTP) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, get user details
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
      { expiresIn: '7d' }
    );

    // Delete OTP after successful verification
    otpStore.delete(normalizedEmail);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users ORDER BY id DESC'
    );

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role (Admin only, or if no admins exist - for initial setup)
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and role are required' });
    }

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "admin" or "student"' });
    }

    // Check if any admin exists (for initial setup)
    const [admins] = await pool.execute(
      'SELECT id FROM users WHERE role = ?',
      ['admin']
    );

    // Allow role update if: user is admin OR no admins exist yet (initial setup)
    const isAdmin = req.user && req.user.role === 'admin';
    const noAdminsExist = admins.length === 0;

    if (!isAdmin && !noAdminsExist) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required or no admins exist for initial setup.' 
      });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update role
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    res.json({
      message: 'User role updated successfully',
      user: {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        role: role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  requestOTP,
  verifyOTP,
  getCurrentUser,
  getAllUsers,
  updateUserRole
};
