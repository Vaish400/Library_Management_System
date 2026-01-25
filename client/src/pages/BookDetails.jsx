import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI, ratingAPI, commentAPI, issueAPI } from '../services/api';
import './BookDetails.css';

const BookDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showReader, setShowReader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const [bookRes, ratingRes, commentsRes] = await Promise.all([
        bookAPI.getBookById(id),
        ratingAPI.getBookRatings(id),
        commentAPI.getBookComments(id)
      ]);

      setBook(bookRes.data.book);
      setAverageRating(ratingRes.data.averageRating || 0);
      setComments(commentsRes.data.comments || []);

      if (user) {
        try {
          const userRatingRes = await ratingAPI.getUserRating(id);
          setUserRating(userRatingRes.data.rating);
        } catch (err) {
          // User hasn't rated yet
        }
      }
    } catch (err) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      await ratingAPI.addRating(id, rating);
      setUserRating(rating);
      fetchBookDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rating');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setActionLoading(true);
    try {
      await commentAPI.addComment(id, newComment);
      setNewComment('');
      fetchBookDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    setActionLoading(true);
    try {
      await commentAPI.updateComment(commentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText('');
      fetchBookDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update comment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setActionLoading(true);
    try {
      await commentAPI.deleteComment(commentId);
      fetchBookDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setActionLoading(false);
    }
  };

  const serverBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fileFullUrl = book?.file_url ? `${serverBaseUrl}${book.file_url}` : null;
  const isPdf = Boolean(book?.file_url && /\.pdf$/i.test(book.file_url));

  const handleReadOnline = () => {
    if (!book?.file_url) return;
    if (isPdf) {
      setShowReader((v) => !v);
      return;
    }
    // For non-PDFs, just open in new tab
    bookAPI.openBookFile(book.file_url);
  };

  const handleDownload = async () => {
    if (!book?.file_url) return;
    const fallbackName = `${book.title || 'book'}-${id}${isPdf ? '.pdf' : ''}`;
    try {
      await bookAPI.downloadBookById(id, fallbackName);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download book');
    }
  };

  const handleIssue = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      await issueAPI.issueBook(id);
      alert('Book issued successfully!');
      fetchBookDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="book-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-error">
        <div className="error-content">
          <div className="error-icon">📚</div>
          <h2>Book Not Found</h2>
          <p>The book you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/books')} className="btn-primary">
            ← Back to Books
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = book.image_url 
    ? `${serverBaseUrl}${book.image_url}`
    : null;

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <button onClick={() => navigate('/books')} className="btn-back">
          ← Back to Books
        </button>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="book-details-main">
          <div className="book-image-card">
            <div className="image-wrapper">
              {imageUrl ? (
                <img src={imageUrl} alt={book.title} className="book-image" />
              ) : (
                <div className="no-image-placeholder-large">
                  <span className="placeholder-icon">📚</span>
                  <span className="placeholder-text">No Image Available</span>
                </div>
              )}
            </div>
            {book.file_url && (
              <div className="file-actions">
                <button onClick={handleReadOnline} className="btn-read">
                  <span className="btn-icon">📖</span>
                  {isPdf ? (showReader ? 'Hide Reader' : 'Read Online') : 'Open File'}
                </button>
                <button onClick={handleDownload} className="btn-download">
                  <span className="btn-icon">📥</span>
                  Download
                </button>
              </div>
            )}
            {user?.role === 'student' && book.quantity > 0 && (
              <button
                onClick={handleIssue}
                disabled={actionLoading}
                className="btn-issue-book"
              >
                {actionLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Issuing...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📚</span>
                    Issue This Book
                  </>
                )}
              </button>
            )}
          </div>

          <div className="book-info-card">
            <div className="book-header">
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">by {book.author}</p>
            </div>

            <div className="book-meta-grid">
              <div className="meta-card">
                <div className="meta-icon">🌐</div>
                <div className="meta-content">
                  <span className="meta-label">Language</span>
                  <span className="meta-value">{book.language || 'English'}</span>
                </div>
              </div>
              <div className="meta-card">
                <div className="meta-icon">📦</div>
                <div className="meta-content">
                  <span className="meta-label">Available</span>
                  <span className="meta-value">{book.quantity} copies</span>
                </div>
              </div>
              {averageRating > 0 && (
                <div className="meta-card">
                  <div className="meta-icon">⭐</div>
                  <div className="meta-content">
                    <span className="meta-label">Rating</span>
                    <span className="meta-value">
                      {parseFloat(averageRating).toFixed(1)} ({book.total_ratings || 0} ratings)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {book.description && (
              <div className="book-description-section">
                <h3 className="section-title">📖 Description</h3>
                <p className="description-text">{book.description}</p>
              </div>
            )}

            <div className="rating-section-card">
              <h3 className="section-title">⭐ Rate this Book</h3>
              <div className="star-rating-container">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      disabled={actionLoading}
                      className={`star-btn ${userRating && star <= userRating ? 'active' : ''}`}
                      title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {userRating && (
                  <span className="rating-feedback">You rated: {userRating} stars</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {book.file_url && isPdf && showReader && (
          <div className="reader-card">
            <div className="reader-header">
              <h3 className="section-title">📄 Read Online</h3>
              <a className="reader-open" href={fileFullUrl} target="_blank" rel="noreferrer">
                Open in new tab ↗
              </a>
            </div>
            <iframe
              className="pdf-frame"
              src={fileFullUrl}
              title={`Read ${book.title}`}
            />
          </div>
        )}

        <div className="comments-section-card">
          <h3 className="section-title">💬 Comments & Reviews</h3>
          
          {user && (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows="4"
                className="comment-input"
              />
              <button
                type="submit"
                disabled={actionLoading || !newComment.trim()}
                className="btn-post-comment"
              >
                {actionLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <span>💬</span>
                    Post Comment
                  </>
                )}
              </button>
            </form>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <div className="empty-icon">💬</div>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-user">
                      <div className="user-avatar">
                        {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="user-info">
                        <strong className="user-name">{comment.user_name}</strong>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    {(user?.id === comment.user_id || user?.role === 'admin') && (
                      <div className="comment-menu">
                        {user?.id === comment.user_id && (
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditCommentText(comment.comment);
                            }}
                            className="btn-edit"
                            title="Edit comment"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="btn-delete"
                          title="Delete comment"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="comment-edit">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        rows="3"
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="btn-save"
                          disabled={!editCommentText.trim()}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditCommentText('');
                          }}
                          className="btn-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-text">{comment.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
