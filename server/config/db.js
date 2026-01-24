const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    connection.release();
    console.log('✅ Database connection pool initialized');
  })
  .catch(err => {
    // Log error but don't prevent server from starting
    console.error('⚠️  Database connection warning:', err.message);
    console.error('   The server will start, but database operations may fail.');
    console.error('   Please check your .env file and ensure MySQL is running.');
  });

module.exports = pool;
