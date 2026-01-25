import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book, onIssue, onReturn, onDelete, onEdit, onRequest, user, showActions = true }) => {
  const isAvailable = book.quantity > 0;
  const imageUrl = book.image_url 
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${book.image_url}`
    : 'https://via.placeholder.com/200x300?text=No+Image';

  return (
    <div className="book-card">
      <Link to={`/books/${book.id}`} className="book-card-link">
        <div className="book-card-image">
          <img src={imageUrl} alt={book.title} />
          {book.average_rating > 0 && (
            <div className="book-rating-badge">
              ⭐ {parseFloat(book.average_rating).toFixed(1)}
            </div>
          )}
        </div>
      </Link>
      <div className="book-card-content">
        <div className="book-card-header">
          <Link to={`/books/${book.id}`} className="book-card-link">
            <h3 className="book-title">{book.title}</h3>
          </Link>
          {user?.role === 'admin' && showActions && (
            <div className="book-actions">
              <button onClick={() => onEdit(book)} className="btn-icon" title="Edit">
                ✏️
              </button>
              <button onClick={() => onDelete(book.id)} className="btn-icon btn-icon-danger" title="Delete">
                🗑️
              </button>
            </div>
          )}
        </div>
        <p className="book-author">by {book.author}</p>
        {book.language && (
          <p className="book-language">🌐 {book.language}</p>
        )}
        <div className="book-footer">
          <span className={`book-quantity ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? `📚 ${book.quantity} available` : '❌ Out of stock'}
          </span>
          {showActions && user?.role === 'student' && (
            <div className="book-actions-student">
              {isAvailable ? (
                <button onClick={() => onIssue && onIssue(book.id)} className="btn btn-primary btn-sm">
                  Issue Book
                </button>
              ) : (
                <button onClick={() => onRequest && onRequest(book)} className="btn btn-secondary btn-sm">
                  Request Book
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
