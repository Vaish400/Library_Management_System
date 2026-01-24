# Database Setup - Quick Guide

## Execute schema.sql to Create Database

Your `schema.sql` file already includes everything needed. Here are 3 ways to execute it:

### Method 1: MySQL Command Line (Easiest)

1. Open Command Prompt or PowerShell
2. Navigate to MySQL bin directory (if not in PATH):
   ```powershell
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   ```
   (Adjust path based on your MySQL installation)

3. Login to MySQL:
   ```bash
   mysql -u root -p
   ```
   Enter your MySQL password when prompted

4. Execute the schema file:
   ```sql
   source e:/Projects for GitHub/Library_Management_System/database/schema.sql
   ```
   
   Or if you're already in the project directory:
   ```sql
   source database/schema.sql
   ```

5. Verify it worked:
   ```sql
   SHOW DATABASES;
   USE library_db;
   SHOW TABLES;
   SELECT COUNT(*) FROM books;
   ```

### Method 2: Using MySQL Command Line with Full Path

1. Open Command Prompt
2. Run:
   ```bash
   mysql -u root -p < "e:\Projects for GitHub\Library_Management_System\database\schema.sql"
   ```

### Method 3: Using the Setup Script

1. Make sure you have `.env` file in `server` directory
2. Open PowerShell in project root
3. Run:
   ```powershell
   cd database
   npm install
   node setup.js
   ```

## What schema.sql Does:

✅ Creates `library_db` database  
✅ Creates `users` table  
✅ Creates `books` table  
✅ Creates `issued_books` table  
✅ Inserts 8 sample books  

After running, restart your server and the error should be gone!
