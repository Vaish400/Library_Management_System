// Quick database check script
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔍 Checking database configuration...\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('  DB_HOST:', process.env.DB_HOST || 'localhost (default)');
    console.log('  DB_USER:', process.env.DB_USER || 'root (default)');
    console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : '❌ NOT SET');
    console.log('  DB_NAME:', process.env.DB_NAME || 'library_db (default)');
    console.log('');
    
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'your_mysql_password_here') {
      console.log('⚠️  WARNING: DB_PASSWORD is not set or is still the placeholder!');
      console.log('   Please update server/.env file with your actual MySQL password.\n');
    }
    
    // Try to connect
    console.log('Attempting to connect to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'library_db'
    });
    
    console.log('✅ Connected to MySQL server\n');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES');
    const dbName = process.env.DB_NAME || 'library_db';
    const dbExists = databases.some(db => db.Database === dbName);
    
    if (!dbExists) {
      console.log(`❌ Database '${dbName}' does not exist!`);
      console.log(`   Run: CREATE DATABASE ${dbName};`);
      console.log(`   Or run: database/schema.sql\n`);
    } else {
      console.log(`✅ Database '${dbName}' exists\n`);
      
      // Check if users table exists
      await connection.query(`USE ${dbName}`);
      const [tables] = await connection.query('SHOW TABLES');
      const usersTableExists = tables.some(table => 
        Object.values(table)[0] === 'users'
      );
      
      if (!usersTableExists) {
        console.log('❌ Table "users" does not exist!');
        console.log('   Run: database/schema.sql\n');
      } else {
        console.log('✅ Table "users" exists');
        
        // Check if there are any users
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log(`   Total users: ${users[0].count}\n`);
      }
    }
    
    await connection.end();
    console.log('✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solution: Check your DB_PASSWORD in server/.env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Make sure MySQL is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Solution: Create the database first: CREATE DATABASE library_db;');
    }
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

checkDatabase();
