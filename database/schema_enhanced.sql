-- Enhanced Library Management System Database Schema
-- Run this to add new features: images, languages, downloads, ratings, comments

USE library_db;

-- Update books table to add new fields
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS file_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS description TEXT NULL,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;

-- Create ratings table
CREATE TABLE IF NOT EXISTS book_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_book_rating (user_id, book_id),
  INDEX idx_book_id (book_id),
  INDEX idx_user_id (user_id)
);

-- Create comments/reviews table
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

-- Update existing books with default language if needed
UPDATE books SET language = 'English' WHERE language IS NULL;
