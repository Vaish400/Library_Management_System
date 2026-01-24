import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI } from '../services/api';
import BookCard from '../components/BookCard';
import './Books.css';

const Books = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [search, authorFilter]);

  const fetchBooks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (authorFilter) params.author = authorFilter;

      const response = await bookAPI.getAllBooks(params);
      setBooks(response.data.books || []);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await bookAPI.deleteBook(bookId);
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleEdit = (book) => {
    window.location.href = `/add-book?edit=${book.id}`;
  };

  if (loading) {
    return (
      <div className="books-loading">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div className="books-page">
      <div className="books-container">
        <div className="books-header">
          <div className="header-content">
            <h1 className="page-title">📚 Library Collection</h1>
            <p className="page-subtitle">
              Explore our vast collection of books and discover your next read
            </p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/add-book" className="btn-add-book">
              <span className="btn-icon">➕</span>
              Add New Book
            </Link>
          )}
        </div>

        <div className="search-section">
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
          <div className="filter-container">
            <div className="filter-icon">👤</div>
            <input
              type="text"
              placeholder="Filter by author..."
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="filter-input"
            />
            {authorFilter && (
              <button
                onClick={() => setAuthorFilter('')}
                className="clear-filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="results-info">
          <p className="results-count">
            {books.length === 0
              ? 'No books found'
              : `${books.length} ${books.length === 1 ? 'book' : 'books'} found`}
          </p>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>No Books Found</h2>
            <p>
              {search || authorFilter
                ? 'Try adjusting your search or filter criteria'
                : user?.role === 'admin'
                ? 'Start building your library collection by adding your first book!'
                : 'The library collection is currently empty'}
            </p>
            {user?.role === 'admin' && !search && !authorFilter && (
              <Link to="/add-book" className="btn-primary">
                ➕ Add Your First Book
              </Link>
            )}
          </div>
        ) : (
          <div className="books-grid">
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                user={user}
                onDelete={user?.role === 'admin' ? () => handleDelete(book.id) : null}
                onEdit={user?.role === 'admin' ? () => handleEdit(book) : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
