// Quick server test script
console.log('🔍 Testing server configuration...\n');

// Test 1: Check environment variables
console.log('1. Environment Variables:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   DB_HOST:', process.env.DB_HOST || 'localhost (default)');
console.log('   DB_USER:', process.env.DB_USER || 'root (default)');
console.log('   DB_NAME:', process.env.DB_NAME || 'library_db (default)');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : '⚠️ NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '***set***' : '⚠️ NOT SET');
console.log('   SMTP_USER:', process.env.SMTP_USER ? '***set***' : '⚠️ NOT SET');
console.log('');

// Test 2: Check required modules
console.log('2. Checking required modules...');
try {
  require('express');
  console.log('   ✅ express');
} catch (e) {
  console.log('   ❌ express -', e.message);
}

try {
  require('mysql2/promise');
  console.log('   ✅ mysql2');
} catch (e) {
  console.log('   ❌ mysql2 -', e.message);
}

try {
  require('dotenv');
  console.log('   ✅ dotenv');
} catch (e) {
  console.log('   ❌ dotenv -', e.message);
}

try {
  require('cors');
  console.log('   ✅ cors');
} catch (e) {
  console.log('   ❌ cors -', e.message);
}

try {
  require('multer');
  console.log('   ✅ multer');
} catch (e) {
  console.log('   ❌ multer -', e.message);
}

console.log('');

// Test 3: Check file structure
console.log('3. Checking file structure...');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'server.js',
  'config/db.js',
  'config/email.js',
  'routes/authRoutes.js',
  'routes/bookRoutes.js',
  'controllers/authController.js',
  'controllers/bookController.js',
  'middleware/authMiddleware.js',
  'middleware/upload.js'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

console.log('');

// Test 4: Try to load server
console.log('4. Testing server load...');
try {
  require('./server.js');
  console.log('   ✅ Server file loaded successfully');
  console.log('   ⚠️  Note: Server will start listening. Press Ctrl+C to stop.');
} catch (e) {
  console.log('   ❌ Error loading server:', e.message);
  console.log('   Stack:', e.stack);
}
