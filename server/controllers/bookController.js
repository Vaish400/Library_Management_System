const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const { search, author } = req.query;
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [books] = await pool.execute(query, params);
    res.json({ books });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book: books[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add new book
const addBook = async (req, res) => {
  try {
    const { title, author, quantity, language, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({ message: 'Author is required' });
    }

    if (quantity === undefined || quantity === null || quantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Handle file uploads
    const imageUrl = req.files?.image?.[0] 
      ? `/uploads/images/${req.files.image[0].filename}` 
      : null;
    
    const fileUrl = req.files?.bookFile?.[0] 
      ? `/uploads/books/${req.files.bookFile[0].filename}` 
      : null;

    // Check if enhanced columns exist
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books'",
      [process.env.DB_NAME || 'library_db']
    );

    const columnNames = columns.map(col => col.COLUMN_NAME);
    const hasEnhancedColumns = columnNames.includes('language') && 
                                columnNames.includes('image_url') && 
                                columnNames.includes('file_url');

    let query, params;

    if (hasEnhancedColumns) {
      query = `INSERT INTO books (title, author, quantity, language, description, image_url, file_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
      params = [
        title.trim(),
        author.trim(),
        parseInt(quantity),
        language || 'English',
        description || null,
        imageUrl,
        fileUrl
      ];
    } else {
      // Fallback to basic insert
      query = 'INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)';
      params = [title.trim(), author.trim(), parseInt(quantity)];
    }

    const [result] = await pool.execute(query, params);

    res.status(201).json({
      message: 'Book added successfully',
      book: {
        id: result.insertId,
        title: title.trim(),
        author: author.trim(),
        quantity: parseInt(quantity),
        language: language || 'English',
        description: description || null,
        image_url: imageUrl,
        file_url: fileUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, quantity, language, description } = req.body;

    // Check if book exists
    const [existingBooks] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (existingBooks.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const existingBook = existingBooks[0];

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({ message: 'Author is required' });
    }

    if (quantity === undefined || quantity === null || quantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Handle file uploads (only update if new file is provided)
    let imageUrl = existingBook.image_url;
    if (req.files?.image?.[0]) {
      imageUrl = `/uploads/images/${req.files.image[0].filename}`;
    }

    let fileUrl = existingBook.file_url;
    if (req.files?.bookFile?.[0]) {
      fileUrl = `/uploads/books/${req.files.bookFile[0].filename}`;
    }

    // Check if enhanced columns exist
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books'",
      [process.env.DB_NAME || 'library_db']
    );

    const columnNames = columns.map(col => col.COLUMN_NAME);
    const hasEnhancedColumns = columnNames.includes('language') && 
                                columnNames.includes('image_url') && 
                                columnNames.includes('file_url');

    let query, params;

    if (hasEnhancedColumns) {
      query = `UPDATE books SET title = ?, author = ?, quantity = ?, language = ?, 
               description = ?, image_url = ?, file_url = ? WHERE id = ?`;
      params = [
        title.trim(),
        author.trim(),
        parseInt(quantity),
        language || 'English',
        description || null,
        imageUrl,
        fileUrl,
        id
      ];
    } else {
      query = 'UPDATE books SET title = ?, author = ?, quantity = ? WHERE id = ?';
      params = [title.trim(), author.trim(), parseInt(quantity), id];
    }

    await pool.execute(query, params);

    res.json({
      message: 'Book updated successfully',
      book: {
        id: parseInt(id),
        title: title.trim(),
        author: author.trim(),
        quantity: parseInt(quantity),
        language: language || 'English',
        description: description || null,
        image_url: imageUrl,
        file_url: fileUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await pool.execute('DELETE FROM books WHERE id = ?', [id]);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download book file (PDF/EPUB/etc.) as attachment
const downloadBookFile = async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await pool.execute(
      'SELECT id, title, file_url FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[0];
    if (!book.file_url) {
      return res.status(404).json({ message: 'No book file available for this book' });
    }

    // file_url is stored like: /uploads/books/<filename.ext>
    const rawRel = String(book.file_url).replace(/^\/+/, '');
    const normalizedRel = path.normalize(rawRel);

    // Prevent path traversal + ensure it's under uploads/books
    const allowedPrefixA = `uploads${path.sep}books${path.sep}`;
    const allowedPrefixB = 'uploads/books/';
    if (!normalizedRel.startsWith(allowedPrefixA) && !normalizedRel.startsWith(allowedPrefixB)) {
      return res.status(400).json({ message: 'Invalid file path' });
    }

    const absPath = path.join(__dirname, '..', normalizedRel);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const ext = path.extname(absPath) || '';
    const safeTitle = String(book.title || 'book')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80);
    const downloadName = `${safeTitle || 'book'}-${book.id}${ext}`;

    return res.download(absPath, downloadName);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  downloadBookFile
};
