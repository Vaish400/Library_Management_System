const pool = require('../config/db');

// Add or update rating
const addRating = async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const userId = req.user.id;

    if (!bookId || !rating) {
      return res.status(400).json({ message: 'Book ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if book exists
    const [books] = await pool.execute('SELECT id FROM books WHERE id = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if rating already exists
    const [existingRatings] = await pool.execute(
      'SELECT id FROM book_ratings WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    if (existingRatings.length > 0) {
      // Update existing rating
      await pool.execute(
        'UPDATE book_ratings SET rating = ? WHERE user_id = ? AND book_id = ?',
        [rating, userId, bookId]
      );
    } else {
      // Insert new rating
      await pool.execute(
        'INSERT INTO book_ratings (user_id, book_id, rating) VALUES (?, ?, ?)',
        [userId, bookId, rating]
      );
    }

    // Update book's average rating and total ratings
    await updateBookRating(bookId);

    res.json({ message: 'Rating saved successfully', rating: parseInt(rating) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's rating for a book
const getUserRating = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const [ratings] = await pool.execute(
      'SELECT rating FROM book_ratings WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    if (ratings.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: ratings[0].rating });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all ratings for a book
const getBookRatings = async (req, res) => {
  try {
    const { bookId } = req.params;

    const [ratings] = await pool.execute(
      `SELECT br.rating, br.created_at, u.name as user_name 
       FROM book_ratings br 
       JOIN users u ON br.user_id = u.id 
       WHERE br.book_id = ? 
       ORDER BY br.created_at DESC`,
      [bookId]
    );

    // Calculate average
    const [book] = await pool.execute(
      'SELECT average_rating, total_ratings FROM books WHERE id = ?',
      [bookId]
    );

    res.json({
      ratings,
      averageRating: book[0]?.average_rating || 0,
      totalRatings: book[0]?.total_ratings || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update book's average rating
const updateBookRating = async (bookId) => {
  try {
    const [ratings] = await pool.execute(
      'SELECT rating FROM book_ratings WHERE book_id = ?',
      [bookId]
    );

    if (ratings.length === 0) {
      await pool.execute(
        'UPDATE books SET average_rating = 0, total_ratings = 0 WHERE id = ?',
        [bookId]
      );
      return;
    }

    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const average = (total / ratings.length).toFixed(2);

    await pool.execute(
      'UPDATE books SET average_rating = ?, total_ratings = ? WHERE id = ?',
      [parseFloat(average), ratings.length, bookId]
    );
  } catch (error) {
    // Silently fail - rating update shouldn't break the main flow
  }
};

module.exports = {
  addRating,
  getUserRating,
  getBookRatings
};
