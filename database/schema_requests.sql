-- Book Requests Table
-- Run this SQL to add the book requests feature

USE library_db;

-- Book requests table for students to request books from admin
CREATE TABLE IF NOT EXISTS book_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
  admin_response TEXT NULL,
  responded_by INT NULL,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
