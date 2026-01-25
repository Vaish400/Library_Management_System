import { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';
import './BookRequests.css';

const BookRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [stats, setStats] = useState(null);
  const [respondModal, setRespondModal] = useState({ open: false, request: null });
  const [responseData, setResponseData] = useState({ status: 'approved', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const response = await requestAPI.getAllRequests(filter === 'all' ? null : filter);
      setRequests(response.data?.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      // Set empty array on error to prevent crashes
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await requestAPI.getRequestStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const openRespondModal = (request) => {
    setRespondModal({ open: true, request });
    setResponseData({ status: 'approved', message: '' });
  };

  const submitResponse = async () => {
    setSubmitting(true);
    try {
      await requestAPI.respondToRequest(
        respondModal.request.id,
        responseData.status,
        responseData.message
      );
      alert(`Request ${responseData.status} successfully! Student has been notified.`);
      setRespondModal({ open: false, request: null });
      fetchRequests();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to request');
    } finally {
      setSubmitting(false);
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
      <div className="requests-loading">
        <div className="loading-spinner"></div>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="requests-page">
      <div className="requests-container">
        <div className="requests-header">
          <div className="header-content">
            <h1 className="page-title">📬 Book Requests</h1>
            <p className="page-subtitle">
              Review and respond to student book requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card stat-pending">
              <span className="stat-icon">⏳</span>
              <div className="stat-info">
                <span className="stat-number">{stats.pending || 0}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            <div className="stat-card stat-approved">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <span className="stat-number">{stats.approved || 0}</span>
                <span className="stat-label">Approved</span>
              </div>
            </div>
            <div className="stat-card stat-rejected">
              <span className="stat-icon">❌</span>
              <div className="stat-info">
                <span className="stat-number">{stats.rejected || 0}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
            <div className="stat-card stat-fulfilled">
              <span className="stat-icon">📦</span>
              <div className="stat-info">
                <span className="stat-number">{stats.fulfilled || 0}</span>
                <span className="stat-label">Fulfilled</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['all', 'pending', 'approved', 'rejected', 'fulfilled'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No Requests Found</h2>
            <p>
              {filter === 'pending' 
                ? 'No pending requests at the moment'
                : `No ${filter} requests to display`}
            </p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
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
                  </div>
                </div>
                
                <div className="request-details">
                  <div className="requester-info">
                    <span className="label">Requested by:</span>
                    <span className="value">{request.user_name}</span>
                    <span className="email">({request.user_email})</span>
                  </div>
                  <div className="request-message">
                    <span className="label">Message:</span>
                    <p className="message-text">"{request.message}"</p>
                  </div>
                  <div className="request-meta">
                    <span className="request-date">
                      📅 {formatDate(request.created_at)}
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  {request.admin_response && (
                    <div className="admin-response">
                      <span className="label">Admin Response:</span>
                      <p>"{request.admin_response}"</p>
                      <span className="responded-by">— {request.admin_name}</span>
                    </div>
                  )}
                </div>
                
                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="btn btn-respond"
                      onClick={() => openRespondModal(request)}
                    >
                      Respond
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Respond Modal */}
        {respondModal.open && (
          <div className="modal-overlay" onClick={() => setRespondModal({ open: false, request: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Respond to Request</h2>
                <button 
                  className="modal-close"
                  onClick={() => setRespondModal({ open: false, request: null })}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="request-summary">
                  <h3>{respondModal.request?.book_title}</h3>
                  <p>Requested by: {respondModal.request?.user_name}</p>
                  <p className="request-msg">"{respondModal.request?.message}"</p>
                </div>
                
                <div className="form-group">
                  <label>Response Status</label>
                  <div className="status-options">
                    <label className={`status-option ${responseData.status === 'approved' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        value="approved"
                        checked={responseData.status === 'approved'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                      />
                      <span className="status-icon">✅</span>
                      Approve
                    </label>
                    <label className={`status-option ${responseData.status === 'fulfilled' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        value="fulfilled"
                        checked={responseData.status === 'fulfilled'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                      />
                      <span className="status-icon">📦</span>
                      Fulfilled
                    </label>
                    <label className={`status-option ${responseData.status === 'rejected' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        value="rejected"
                        checked={responseData.status === 'rejected'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                      />
                      <span className="status-icon">❌</span>
                      Reject
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="responseMessage">Your Message to Student (Optional)</label>
                  <textarea
                    id="responseMessage"
                    placeholder="Add a message for the student..."
                    value={responseData.message}
                    onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                    rows={3}
                    className="response-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setRespondModal({ open: false, request: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={submitResponse}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRequests;
