import { useState, useEffect } from 'react';
import { issueAPI, bookAPI } from '../services/api';
import './IssueBook.css';

const IssueBook = ({ user }) => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const [booksRes, issuesRes] = await Promise.all([
        bookAPI.getAllBooks(),
        user.role === 'admin' 
          ? issueAPI.getAllIssuedBooks() 
          : issueAPI.getMyIssuedBooks()
      ]);

      setBooks(booksRes.data?.books || []);
      setIssuedBooks(issuesRes.data?.issuedBooks || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load data';
      setError(errorMsg);
      // Set empty arrays on error to prevent crashes
      setBooks([]);
      setIssuedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!selectedBookId) {
      setError('Please select a book');
      return;
    }

    setError('');
    setMessage('');
    setActionLoading(true);

    try {
      const bookIdNum = typeof selectedBookId === 'string' ? parseInt(selectedBookId) : selectedBookId;
      if (isNaN(bookIdNum)) {
        setError('Invalid book ID');
        setActionLoading(false);
        return;
      }
      await issueAPI.issueBook(bookIdNum);
      setMessage('Book issued successfully!');
      setSelectedBookId('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async (issueId) => {
    if (!window.confirm('Are you sure you want to return this book?')) {
      return;
    }

    setError('');
    setMessage('');
    setActionLoading(true);

    try {
      await issueAPI.returnBook(issueId);
      setMessage('Book returned successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="issue-book-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const availableBooks = books.filter(b => b.quantity > 0);
  const activeIssues = issuedBooks.filter(ib => !ib.return_date);

  return (
    <div className="issue-book-page">
      <div className="issue-book-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              {user.role === 'admin' ? '📋 Manage Book Issues' : '📚 Issue/Return Books'}
            </h1>
            <p className="page-subtitle">
              {user.role === 'admin' 
                ? 'View and manage all book issues and returns across the library'
                : 'Issue new books or return books you\'ve finished reading'}
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {message}
          </div>
        )}

        {user.role === 'student' && (
          <div className="issue-section">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📖</span>
                  Issue a Book
                </h2>
              </div>
              <div className="issue-form">
                <div className="form-group">
                  <label className="form-label">Select Book</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="book-select"
                    >
                      <option value="">Choose a book to issue...</option>
                      {availableBooks.map(book => (
                        <option key={book.id} value={book.id}>
                          {book.title} by {book.author} ({book.quantity} available)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleIssue}
                  disabled={!selectedBookId || actionLoading}
                  className="btn btn-primary btn-issue"
                >
                  {actionLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Issuing...
                    </>
                  ) : (
                    <>
                      <span>📚</span>
                      Issue Book
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="issues-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">
                {user.role === 'admin' ? '📋' : '📖'}
              </span>
              {user.role === 'admin' ? 'All Issued Books' : 'My Issued Books'}
            </h2>
            <span className="badge">{activeIssues.length}</span>
          </div>

          {activeIssues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Active Issues</h3>
              <p>
                {user.role === 'admin'
                  ? 'No books are currently issued to any users'
                  : 'You don\'t have any books issued at the moment'}
              </p>
            </div>
          ) : (
            <div className="issues-grid">
              {activeIssues.map(issue => (
                <div key={issue.id} className="issue-card">
                  <div className="issue-content">
                    <div className="issue-header">
                      <h3 className="issue-title">{issue.title || issue.book_title}</h3>
                      <span className="issue-status">Active</span>
                    </div>
                    <div className="issue-details">
                      <div className="detail-item">
                        <span className="detail-label">👤 Author:</span>
                        <span className="detail-value">{issue.author || issue.book_author}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📅 Issue Date:</span>
                        <span className="detail-value">
                          {new Date(issue.issue_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {user.role === 'admin' && (
                        <div className="detail-item">
                          <span className="detail-label">👤 Issued To:</span>
                          <span className="detail-value">{issue.user_name || issue.user_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {user.role === 'student' && (
                    <button
                      onClick={() => handleReturn(issue.id)}
                      disabled={actionLoading}
                      className="btn btn-return"
                    >
                      {actionLoading ? (
                        <>
                          <span className="btn-spinner"></span>
                          Returning...
                        </>
                      ) : (
                        <>
                          <span>↩️</span>
                          Return Book
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueBook;
