const pool = require('../config/db');

// Issue a book
const issueBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    // Convert bookId to integer if it's a string
    const bookIdInt = parseInt(bookId);
    if (isNaN(bookIdInt)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    // Check if book exists and is available
    const [books] = await pool.execute(
      'SELECT id, title, quantity FROM books WHERE id = ?',
      [bookIdInt]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[0];

    if (book.quantity <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if user already has this book issued
    const [existingIssues] = await pool.execute(
      'SELECT id FROM issued_books WHERE user_id = ? AND book_id = ? AND return_date IS NULL',
      [userId, bookIdInt]
    );

    if (existingIssues.length > 0) {
      return res.status(400).json({ message: 'You have already issued this book' });
    }

    // Issue the book
    const issueDate = new Date().toISOString().split('T')[0];
    await pool.execute(
      'INSERT INTO issued_books (user_id, book_id, issue_date) VALUES (?, ?, ?)',
      [userId, bookIdInt, issueDate]
    );

    // Decrease book quantity
    await pool.execute(
      'UPDATE books SET quantity = quantity - 1 WHERE id = ?',
      [bookIdInt]
    );

    res.json({
      message: 'Book issued successfully',
      issueDate
    });
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Return a book
const returnBook = async (req, res) => {
  try {
    const { issueId } = req.body;
    const userId = req.user.id;

    if (!issueId) {
      return res.status(400).json({ message: 'Issue ID is required' });
    }

    // Check if issue exists and belongs to user
    const [issues] = await pool.execute(
      'SELECT id, book_id, return_date FROM issued_books WHERE id = ? AND user_id = ?',
      [issueId, userId]
    );

    if (issues.length === 0) {
      return res.status(404).json({ message: 'Issue not found or you do not have permission' });
    }

    const issue = issues[0];

    if (issue.return_date !== null) {
      return res.status(400).json({ message: 'Book has already been returned' });
    }

    // Return the book
    const returnDate = new Date().toISOString().split('T')[0];
    await pool.execute(
      'UPDATE issued_books SET return_date = ? WHERE id = ?',
      [returnDate, issueId]
    );

    // Increase book quantity
    await pool.execute(
      'UPDATE books SET quantity = quantity + 1 WHERE id = ?',
      [issue.book_id]
    );

    res.json({
      message: 'Book returned successfully',
      returnDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my issued books
const getMyIssuedBooks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if table exists, if not return empty array
    try {
      // First check if table exists
      const [tables] = await pool.execute(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'issued_books'`
      );

      if (tables.length === 0) {
        console.warn('issued_books table does not exist. Please run create_database.sql');
        return res.json({ issuedBooks: [] });
      }

      // Check if image_url column exists in books table
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME 
         FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'books' 
         AND COLUMN_NAME = 'image_url'`
      );
      
      const hasImageUrl = columns.length > 0;
      const imageUrlSelect = hasImageUrl ? 'b.image_url,' : 'NULL as image_url,';
      
      const [issuedBooks] = await pool.execute(
        `SELECT ib.id, ib.issue_date, ib.return_date, b.id as book_id, b.title, b.author, ${imageUrlSelect}
         FROM issued_books ib
         JOIN books b ON ib.book_id = b.id
         WHERE ib.user_id = ?
         ORDER BY ib.issue_date DESC`,
        [userId]
      );

      res.json({ issuedBooks: issuedBooks || [] });
    } catch (dbError) {
      // If table doesn't exist or any other DB error, return empty array
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.warn('Database table issue. Please run create_database.sql');
        return res.json({ issuedBooks: [] });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching issued books:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all issued books (admin only)
const getAllIssuedBooks = async (req, res) => {
  try {
    const [issuedBooks] = await pool.execute(
      `SELECT ib.id, ib.issue_date, ib.return_date, 
              b.id as book_id, b.title, b.author,
              u.id as user_id, u.name as user_name, u.email as user_email
       FROM issued_books ib
       JOIN books b ON ib.book_id = b.id
       JOIN users u ON ib.user_id = u.id
       ORDER BY ib.issue_date DESC`
    );

    res.json({ issuedBooks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  issueBook,
  returnBook,
  getMyIssuedBooks,
  getAllIssuedBooks
};
