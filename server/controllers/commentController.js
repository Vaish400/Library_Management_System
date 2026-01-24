const pool = require('../config/db');

// Add comment
const addComment = async (req, res) => {
  try {
    const { bookId, comment } = req.body;
    const userId = req.user.id;

    if (!bookId || !comment || !comment.trim()) {
      return res.status(400).json({ message: 'Book ID and comment are required' });
    }

    // Check if book exists
    const [books] = await pool.execute('SELECT id FROM books WHERE id = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const [result] = await pool.execute(
      'INSERT INTO book_comments (user_id, book_id, comment) VALUES (?, ?, ?)',
      [userId, bookId, comment.trim()]
    );

    // Get the created comment with user info
    const [comments] = await pool.execute(
      `SELECT bc.id, bc.comment, bc.created_at, bc.updated_at, u.name as user_name, u.email as user_email
       FROM book_comments bc
       JOIN users u ON bc.user_id = u.id
       WHERE bc.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment: comments[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all comments for a book
const getBookComments = async (req, res) => {
  try {
    const { bookId } = req.params;

    const [comments] = await pool.execute(
      `SELECT bc.id, bc.comment, bc.created_at, bc.updated_at, u.id as user_id, u.name as user_name, u.email as user_email
       FROM book_comments bc
       JOIN users u ON bc.user_id = u.id
       WHERE bc.book_id = ?
       ORDER BY bc.created_at DESC`,
      [bookId]
    );

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // Check if comment exists
    const [comments] = await pool.execute(
      'SELECT user_id FROM book_comments WHERE id = ?',
      [id]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comments[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    await pool.execute(
      'UPDATE book_comments SET comment = ? WHERE id = ?',
      [comment.trim(), id]
    );

    // Get updated comment
    const [updatedComments] = await pool.execute(
      `SELECT bc.id, bc.comment, bc.created_at, bc.updated_at, u.name as user_name, u.email as user_email
       FROM book_comments bc
       JOIN users u ON bc.user_id = u.id
       WHERE bc.id = ?`,
      [id]
    );

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComments[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if comment exists
    const [comments] = await pool.execute(
      'SELECT user_id FROM book_comments WHERE id = ?',
      [id]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comments[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await pool.execute('DELETE FROM book_comments WHERE id = ?', [id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addComment,
  getBookComments,
  updateComment,
  deleteComment
};
