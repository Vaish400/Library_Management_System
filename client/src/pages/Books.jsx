import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, issueAPI, requestAPI } from '../services/api';
import BookCard from '../components/BookCard';
import './Books.css';

const Books = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [requestModal, setRequestModal] = useState({ open: false, book: null });
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleIssue = async (bookId) => {
    try {
      // Ensure bookId is a number
      const bookIdNum = typeof bookId === 'string' ? parseInt(bookId) : bookId;
      if (isNaN(bookIdNum)) {
        alert('Invalid book ID');
        return;
      }
      await issueAPI.issueBook(bookIdNum);
      alert('Book issued successfully!');
      fetchBooks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to issue book';
      alert(errorMessage);
      console.error('Issue book error:', error);
    }
  };

  const handleRequestBook = (book) => {
    setRequestModal({ open: true, book });
    setRequestMessage('');
  };

  const submitRequest = async () => {
    const trimmedMessage = requestMessage.trim();
    
    if (!trimmedMessage) {
      alert('Please enter a message explaining why you need this book');
      return;
    }

    if (trimmedMessage.length < 10) {
      alert('Please provide more details (at least 10 characters)');
      return;
    }

    if (trimmedMessage.length > 500) {
      alert('Message is too long. Please keep it under 500 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await requestAPI.createRequest(requestModal.book.id, trimmedMessage);
      alert('✅ Request submitted successfully! Admin will be notified via email.');
      setRequestModal({ open: false, book: null });
      setRequestMessage('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit request. Please try again.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
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
                onIssue={handleIssue}
                onRequest={handleRequestBook}
                onDelete={user?.role === 'admin' ? () => handleDelete(book.id) : null}
                onEdit={user?.role === 'admin' ? () => handleEdit(book) : null}
              />
            ))}
          </div>
        )}

        {/* Request Book Modal */}
        {requestModal.open && (
          <div className="modal-overlay" onClick={() => setRequestModal({ open: false, book: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Request Book</h2>
                <button 
                  className="modal-close"
                  onClick={() => setRequestModal({ open: false, book: null })}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="request-book-info">
                  <h3>{requestModal.book?.title}</h3>
                  <p>by {requestModal.book?.author}</p>
                </div>
                <div className="form-group">
                  <label htmlFor="requestMessage">
                    Your Message to Admin <span className="required">*</span>
                  </label>
                  <textarea
                    id="requestMessage"
                    placeholder="Please explain:&#10;• Why you need this book&#10;• When you need it (urgency)&#10;• Any specific purpose (assignment, research, personal reading, etc.)&#10;&#10;Example: 'I need this book for my literature assignment due next week. It's required reading for my English class.'"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={6}
                    className="request-textarea"
                    maxLength={500}
                  />
                  <div className="char-counter">
                    <span className={requestMessage.length > 500 ? 'char-error' : ''}>
                      {requestMessage.length}/500 characters
                    </span>
                    {requestMessage.length < 10 && requestMessage.length > 0 && (
                      <span className="char-warning"> (Minimum 10 characters required)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setRequestModal({ open: false, book: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={submitRequest}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
