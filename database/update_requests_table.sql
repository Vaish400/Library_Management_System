-- Update book_requests table to support general issues (book_id can be NULL)
USE library_db;

-- Modify book_requests table to allow NULL book_id for general issues
ALTER TABLE book_requests 
MODIFY COLUMN book_id INT NULL,
ADD COLUMN request_type ENUM('book', 'issue') DEFAULT 'book',
ADD COLUMN subject VARCHAR(200) NULL,
ADD COLUMN category VARCHAR(50) NULL,
ADD COLUMN urgency ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal';

-- Update existing records to have request_type = 'book'
UPDATE book_requests SET request_type = 'book' WHERE request_type IS NULL;
