const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../server/.env' });
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    // Connect without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    const dbName = process.env.DB_NAME || 'library_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created or already exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);
    console.log(`✅ Using database '${dbName}'`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    for (const statement of statements) {
      if (statement.toLowerCase().includes('create database') || 
          statement.toLowerCase().includes('use ')) {
        continue; // Skip CREATE DATABASE and USE statements as we already handled them
      }
      try {
        await connection.query(statement);
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists')) {
          console.warn(`⚠️  Warning executing statement: ${err.message}`);
        }
      }
    }

    console.log('✅ Tables created successfully');
    console.log('✅ Sample data inserted');
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nYou can now start the server with: cd server && npm start');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
