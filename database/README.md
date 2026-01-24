# Database Setup Instructions

## Quick Fix for "Unknown database" Error

If you're getting the error `❌ Database connection error: Unknown database 'library_db'`, follow these steps:

### Option 1: Using MySQL Command Line (Recommended)

1. Open MySQL command line:
```bash
mysql -u root -p
```

2. Run the create database script:
```bash
source database/create_database.sql
```

3. Then run the full schema:
```bash
source database/schema.sql
```

### Option 2: Using Node.js Setup Script

1. Make sure you have a `.env` file in the `server` directory with your MySQL credentials

2. From the project root, run:
```bash
cd database
npm install mysql2
node setup.js
```

### Option 3: Manual SQL Commands

1. Connect to MySQL:
```bash
mysql -u root -p
```

2. Run these commands:
```sql
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','student') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issued_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  issue_date DATE NOT NULL,
  return_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_return_date (return_date)
);
```

3. (Optional) Insert sample books:
```sql
INSERT INTO books (title, author, quantity) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 5),
('To Kill a Mockingbird', 'Harper Lee', 3),
('1984', 'George Orwell', 4),
('Pride and Prejudice', 'Jane Austen', 6),
('The Catcher in the Rye', 'J.D. Salinger', 2),
('Lord of the Flies', 'William Golding', 3),
('Animal Farm', 'George Orwell', 5),
('Brave New World', 'Aldous Huxley', 4);
```

## Verify Database Creation

After setup, verify the database exists:
```sql
SHOW DATABASES;
USE library_db;
SHOW TABLES;
```

You should see:
- `users`
- `books`
- `issued_books`

## Troubleshooting

### MySQL not running
- Windows: Check Services or start MySQL from XAMPP/WAMP
- Linux/Mac: `sudo service mysql start` or `brew services start mysql`

### Permission denied
- Make sure your MySQL user has CREATE DATABASE privileges
- Or create the database manually as root user

### Port issues
- Default MySQL port is 3306
- Check your `.env` file has correct `DB_HOST` and `DB_PORT` (if different)
