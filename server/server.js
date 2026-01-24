const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const issueRoutes = require('./routes/issueRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const commentRoutes = require('./routes/commentRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = require('./config/db');
    const [result] = await pool.execute('SELECT 1 as test');
    res.json({ 
      message: 'Database connection successful', 
      status: 'OK',
      test: result[0]
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message,
      details: 'Check your .env file and ensure MySQL is running'
    });
  }
});

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  // Handle multer errors
  if (err.code && (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT')) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 100MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 2 files.' });
    }
    return res.status(400).json({ message: 'File upload error', error: err.message });
  }
  
  // Handle other errors
  if (err.message) {
    return res.status(err.status || 400).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Internal server error', error: err.message || 'Unknown error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Library Management System API`);
  console.log(`📧 Email configured: ${process.env.SMTP_USER ? 'Yes' : 'No'}`);
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log(`\n💡 Solutions:`);
    console.log(`   1. Kill the process using port ${PORT}:`);
    console.log(`      Windows: netstat -ano | findstr :${PORT}`);
    console.log(`      Then: taskkill /PID <PID> /F`);
    console.log(`   2. Or change PORT in .env file to a different port (e.g., 5001)`);
    console.log(`\n   Trying to find and kill the process...\n`);
    process.exit(1);
  } else {
    process.exit(1);
  }
});
