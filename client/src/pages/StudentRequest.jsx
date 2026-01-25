import { useState } from 'react';
import { requestAPI, bookAPI, issueReportAPI } from '../services/api';
import './StudentRequest.css';

const StudentRequest = ({ user }) => {
  const [requestType, setRequestType] = useState('book'); // 'book' or 'issue'
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    urgency: 'normal',
    category: 'general'
  });
  const [submitting, setSubmitting] = useState(false);
  const [showBookSearch, setShowBookSearch] = useState(false);

  // Fetch books for search
  const searchBooks = async (query) => {
    if (query.length < 2) {
      setBooks([]);
      return;
    }
    try {
      const response = await bookAPI.getAllBooks({ search: query });
      setBooks(response.data?.books || []);
    } catch (error) {
      setBooks([]);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchBooks(query);
    setShowBookSearch(query.length >= 2);
  };

  const selectBook = (book) => {
    setSelectedBook(book);
    setSearchQuery(book.title);
    setShowBookSearch(false);
    setBooks([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (requestType === 'book' && !selectedBook) {
      alert('Please select a book to request');
      return;
    }

    if (!formData.message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (formData.message.trim().length < 10) {
      alert('Please provide more details (at least 10 characters)');
      return;
    }

    setSubmitting(true);
    try {
      if (requestType === 'book') {
        await requestAPI.createRequest(selectedBook.id, formData.message);
        alert('✅ Book request submitted successfully! Admin will be notified via email.');
      } else {
        // Submit general issue
        await issueReportAPI.createIssue(
          formData.subject,
          formData.message,
          formData.category,
          formData.urgency
        );
        alert('✅ Issue reported successfully! Admin will be notified via email.');
      }
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        urgency: 'normal',
        category: 'general'
      });
      setSelectedBook(null);
      setSearchQuery('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit request. Please try again.';
      alert(errorMsg);
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-request-page">
      <div className="request-container">
        <div className="request-header">
          <h1 className="page-title">📝 Submit Request</h1>
          <p className="page-subtitle">
            Request a book or report an issue to the library administration
          </p>
        </div>

        <div className="request-type-tabs">
          <button
            className={`type-tab ${requestType === 'book' ? 'active' : ''}`}
            onClick={() => {
              setRequestType('book');
              setSelectedBook(null);
              setSearchQuery('');
            }}
          >
            📚 Request Book
          </button>
          <button
            className={`type-tab ${requestType === 'issue' ? 'active' : ''}`}
            onClick={() => {
              setRequestType('issue');
              setSelectedBook(null);
              setSearchQuery('');
            }}
          >
            ⚠️ Report Issue
          </button>
        </div>

        <form className="request-form" onSubmit={handleSubmit}>
          {requestType === 'book' && (
            <div className="form-group">
              <label htmlFor="bookSearch">
                Search and Select Book <span className="required">*</span>
              </label>
              <div className="book-search-wrapper">
                <input
                  id="bookSearch"
                  type="text"
                  placeholder="Type book title or author to search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="book-search-input"
                  required
                />
                {showBookSearch && books.length > 0 && (
                  <div className="book-search-results">
                    {books.map(book => (
                      <div
                        key={book.id}
                        className="book-search-item"
                        onClick={() => selectBook(book)}
                      >
                        <div className="book-item-info">
                          <h4>{book.title}</h4>
                          <p>by {book.author}</p>
                          <span className={`book-status ${book.quantity > 0 ? 'available' : 'unavailable'}`}>
                            {book.quantity > 0 ? `📚 ${book.quantity} available` : '❌ Out of stock'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedBook && (
                  <div className="selected-book">
                    <span className="selected-icon">✓</span>
                    <span className="selected-text">
                      Selected: <strong>{selectedBook.title}</strong> by {selectedBook.author}
                    </span>
                    <button
                      type="button"
                      className="clear-selection"
                      onClick={() => {
                        setSelectedBook(null);
                        setSearchQuery('');
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {requestType === 'issue' && (
            <>
              <div className="form-group">
                <label htmlFor="subject">
                  Subject <span className="required">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Brief description of the issue..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input"
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="general">General Issue</option>
                    <option value="technical">Technical Problem</option>
                    <option value="account">Account Issue</option>
                    <option value="book">Book Related</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="urgency">Urgency</label>
                  <select
                    id="urgency"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="message">
              {requestType === 'book' ? 'Your Message to Admin' : 'Detailed Description'} 
              <span className="required">*</span>
            </label>
            <textarea
              id="message"
              placeholder={
                requestType === 'book'
                  ? 'Please explain:\n• Why you need this book\n• When you need it (urgency)\n• Any specific purpose (assignment, research, personal reading, etc.)\n\nExample: "I need this book for my literature assignment due next week. It\'s required reading for my English class."'
                  : 'Please provide detailed information about the issue:\n• What happened?\n• When did it occur?\n• Steps to reproduce (if applicable)\n• Expected vs actual behavior'
              }
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="form-textarea"
              required
              maxLength={500}
            />
            <div className="char-counter">
              <span className={formData.message.length > 500 ? 'char-error' : ''}>
                {formData.message.length}/500 characters
              </span>
              {formData.message.length < 10 && formData.message.length > 0 && (
                <span className="char-warning"> (Minimum 10 characters required)</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  subject: '',
                  message: '',
                  urgency: 'normal',
                  category: 'general'
                });
                setSelectedBook(null);
                setSearchQuery('');
              }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || (requestType === 'book' && !selectedBook)}
            >
              {submitting ? 'Submitting...' : requestType === 'book' ? 'Submit Book Request' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRequest;
