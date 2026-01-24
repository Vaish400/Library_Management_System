const pool = require('../config/db');

// Issue a book
const issueBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    // Check if book exists and is available
    const [books] = await pool.execute(
      'SELECT id, title, quantity FROM books WHERE id = ?',
      [bookId]
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
      [userId, bookId]
    );

    if (existingIssues.length > 0) {
      return res.status(400).json({ message: 'You have already issued this book' });
    }

    // Issue the book
    const issueDate = new Date().toISOString().split('T')[0];
    await pool.execute(
      'INSERT INTO issued_books (user_id, book_id, issue_date) VALUES (?, ?, ?)',
      [userId, bookId, issueDate]
    );

    // Decrease book quantity
    await pool.execute(
      'UPDATE books SET quantity = quantity - 1 WHERE id = ?',
      [bookId]
    );

    res.json({
      message: 'Book issued successfully',
      issueDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const userId = req.user.id;

    const [issuedBooks] = await pool.execute(
      `SELECT ib.id, ib.issue_date, ib.return_date, b.id as book_id, b.title, b.author, b.image_url
       FROM issued_books ib
       JOIN books b ON ib.book_id = b.id
       WHERE ib.user_id = ?
       ORDER BY ib.issue_date DESC`,
      [userId]
    );

    res.json({ issuedBooks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
