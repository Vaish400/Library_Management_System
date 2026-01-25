import { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';
import './MyRequests.css';

const MyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await requestAPI.getMyRequests();
      setRequests(response.data?.requests || []);
    } catch (error) {
      // Silently handle errors - set empty array to prevent crashes
      setRequests([]);
      // Don't log errors - they're handled gracefully on server side
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { emoji: '⏳', class: 'badge-pending', text: 'Pending' },
      approved: { emoji: '✅', class: 'badge-approved', text: 'Approved' },
      rejected: { emoji: '❌', class: 'badge-rejected', text: 'Rejected' },
      fulfilled: { emoji: '📦', class: 'badge-fulfilled', text: 'Fulfilled' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.emoji} {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="my-requests-loading">
        <div className="loading-spinner"></div>
        <p>Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <div className="my-requests-container">
        <div className="my-requests-header">
          <h1 className="page-title">📋 My Book Requests</h1>
          <p className="page-subtitle">
            Track the status of your book requests
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No Requests Yet</h2>
            <p>
              You haven't made any book requests yet. When a book is out of stock,
              you can request it and the admin will be notified.
            </p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className={`request-card status-${request.status}`}>
                <div className="request-book-info">
                  <div className="book-image">
                    {request.book_image ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${request.book_image}`}
                        alt={request.book_title}
                      />
                    ) : (
                      <div className="no-image">📚</div>
                    )}
                  </div>
                  <div className="book-details">
                    <h3>{request.book_title}</h3>
                    <p className="book-author">by {request.book_author}</p>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="request-details">
                  <div className="your-message">
                    <span className="label">Your message:</span>
                    <p className="message-text">"{request.message}"</p>
                  </div>
                  <div className="request-date">
                    📅 Requested on {formatDate(request.created_at)}
                  </div>
                  
                  {request.admin_response && (
                    <div className="admin-response">
                      <span className="label">Admin's Response:</span>
                      <p>"{request.admin_response}"</p>
                      <span className="responded-by">
                        — {request.admin_name} • {formatDate(request.responded_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
