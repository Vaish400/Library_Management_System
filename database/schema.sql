-- Library Management System Database Schema

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','student') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 0,
  language VARCHAR(50) DEFAULT 'English',
  image_url VARCHAR(500) NULL,
  file_url VARCHAR(500) NULL,
  description TEXT NULL,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE IF NOT EXISTS book_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_book_rating (user_id, book_id),
  INDEX idx_book_id (book_id),
  INDEX idx_user_id (user_id)
);

-- Comments/reviews table
CREATE TABLE IF NOT EXISTS book_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_book_id (book_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Issued books table
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

-- Insert sample admin user (password: admin123 - change this in production!)
-- Note: This is a hashed password, you should create admin through registration
-- INSERT INTO users (name, email, password, role) VALUES 
-- ('Admin User', 'admin@library.com', '$2a$10$YourHashedPasswordHere', 'admin');

-- Insert sample books
INSERT INTO books (title, author, quantity) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 5),
('To Kill a Mockingbird', 'Harper Lee', 3),
('1984', 'George Orwell', 4),
('Pride and Prejudice', 'Jane Austen', 6),
('The Catcher in the Rye', 'J.D. Salinger', 2),
('Lord of the Flies', 'William Golding', 3),
('Animal Farm', 'George Orwell', 5),
('Brave New World', 'Aldous Huxley', 4);
