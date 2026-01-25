import { useState, useEffect } from 'react';
import { issueReportAPI } from '../services/api';
import './AdminIssues.css';

const AdminIssues = ({ user }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [respondModal, setRespondModal] = useState({ open: false, issue: null });
  const [responseData, setResponseData] = useState({ status: 'resolved', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, [filter, categoryFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issueReportAPI.getAllIssues(
        filter === 'all' ? null : filter,
        categoryFilter === 'all' ? null : categoryFilter
      );
      
      if (response.data?.success !== false) {
        setIssues(response.data?.issues || []);
      } else {
        setIssues([]);
        console.error('Failed to fetch issues:', response.data?.message);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setIssues([]);
      // Show user-friendly error message
      if (error.response?.status !== 500) {
        alert(error.response?.data?.message || 'Failed to load issues. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await issueReportAPI.getIssueStats();
      if (response.data?.success !== false) {
        setStats(response.data?.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Don't show error for stats - it's not critical
    }
  };

  const openRespondModal = (issue) => {
    setRespondModal({ open: true, issue });
    setResponseData({ status: issue.status === 'open' ? 'in_progress' : issue.status, message: '' });
  };

  const submitResponse = async () => {
    // Validate response message length
    if (responseData.message && responseData.message.trim().length > 1000) {
      alert('Response message must be less than 1000 characters');
      return;
    }

    // Confirm action for status changes
    const statusLabels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };

    if (responseData.status === 'closed' && respondModal.issue.status !== 'closed') {
      if (!window.confirm(`Are you sure you want to close this issue? This action cannot be undone.`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await issueReportAPI.respondToIssue(
        respondModal.issue.id,
        responseData.status,
        responseData.message.trim() || null
      );
      
      if (response.data?.success !== false) {
        alert(`✅ Issue updated to ${statusLabels[responseData.status]} successfully! Student has been notified via email.`);
        setRespondModal({ open: false, issue: null });
        setResponseData({ status: 'resolved', message: '' });
        fetchIssues();
        fetchStats();
      } else {
        alert(response.data?.message || 'Failed to update issue');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to update issue. Please try again.';
      alert(errorMsg);
      console.error('Update issue error:', error);
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
      open: { emoji: '🔴', class: 'badge-open', text: 'Open' },
      in_progress: { emoji: '🟡', class: 'badge-progress', text: 'In Progress' },
      resolved: { emoji: '🟢', class: 'badge-resolved', text: 'Resolved' },
      closed: { emoji: '⚫', class: 'badge-closed', text: 'Closed' }
    };
    const badge = badges[status] || badges.open;
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.emoji} {badge.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      low: { emoji: '🟢', class: 'urgency-low', text: 'Low' },
      normal: { emoji: '🟡', class: 'urgency-normal', text: 'Normal' },
      high: { emoji: '🟠', class: 'urgency-high', text: 'High' },
      urgent: { emoji: '🔴', class: 'urgency-urgent', text: 'Urgent' }
    };
    const badge = badges[urgency] || badges.normal;
    return (
      <span className={`urgency-badge ${badge.class}`}>
        {badge.emoji} {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="issues-loading">
        <div className="loading-spinner"></div>
        <p>Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="admin-issues-page">
      <div className="issues-container">
        <div className="issues-header">
          <div className="header-content">
            <h1 className="page-title">⚠️ Reported Issues</h1>
            <p className="page-subtitle">
              Review and respond to student-reported issues
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card stat-open">
              <span className="stat-icon">🔴</span>
              <div className="stat-info">
                <span className="stat-number">{stats.open || 0}</span>
                <span className="stat-label">Open</span>
              </div>
            </div>
            <div className="stat-card stat-progress">
              <span className="stat-icon">🟡</span>
              <div className="stat-info">
                <span className="stat-number">{stats.in_progress || 0}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>
            <div className="stat-card stat-resolved">
              <span className="stat-icon">🟢</span>
              <div className="stat-info">
                <span className="stat-number">{stats.resolved || 0}</span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>
            <div className="stat-card stat-closed">
              <span className="stat-icon">⚫</span>
              <div className="stat-info">
                <span className="stat-number">{stats.closed || 0}</span>
                <span className="stat-label">Closed</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-section">
          <div className="filter-tabs">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((tab) => (
              <button
                key={tab}
                className={`filter-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="category-filter">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="book">Book Related</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No Issues Found</h2>
            <p>
              {filter === 'open' 
                ? 'No open issues at the moment'
                : `No ${filter} issues to display`}
            </p>
          </div>
        ) : (
          <div className="issues-list">
            {issues.map((issue) => (
              <div key={issue.id} className={`issue-card status-${issue.status}`}>
                <div className="issue-header">
                  <div className="issue-title-section">
                    <h3>{issue.subject}</h3>
                    <div className="issue-meta">
                      {getStatusBadge(issue.status)}
                      {getUrgencyBadge(issue.urgency)}
                      <span className="issue-category">{issue.category}</span>
                    </div>
                  </div>
                  <div className="issue-date">
                    📅 {formatDate(issue.created_at)}
                  </div>
                </div>
                
                <div className="issue-details">
                  <div className="reporter-info">
                    <span className="label">Reported by:</span>
                    <span className="value">{issue.user_name}</span>
                    <span className="email">({issue.user_email})</span>
                  </div>
                  <div className="issue-message">
                    <span className="label">Description:</span>
                    <p className="message-text">"{issue.message}"</p>
                  </div>
                  
                  {issue.admin_response && (
                    <div className="admin-response">
                      <span className="label">Your Response:</span>
                      <p>"{issue.admin_response}"</p>
                      <span className="responded-by">— {issue.admin_name || 'You'} • {formatDate(issue.responded_at)}</span>
                    </div>
                  )}
                </div>
                
                {issue.status !== 'closed' && (
                  <div className="issue-actions">
                    <button 
                      className="btn btn-respond"
                      onClick={() => openRespondModal(issue)}
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
          <div className="modal-overlay" onClick={() => setRespondModal({ open: false, issue: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Respond to Issue</h2>
                <button 
                  className="modal-close"
                  onClick={() => setRespondModal({ open: false, issue: null })}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="issue-summary">
                  <h3>{respondModal.issue?.subject}</h3>
                  <p>Reported by: {respondModal.issue?.user_name}</p>
                  <p className="issue-msg">"{respondModal.issue?.message}"</p>
                </div>
                
                <div className="form-group">
                  <label>Update Status</label>
                  <div className="status-options">
                    <label className={`status-option ${responseData.status === 'in_progress' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        value="in_progress"
                        checked={responseData.status === 'in_progress'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                      />
                      <span className="status-icon">🟡</span>
                      In Progress
                    </label>
                    <label className={`status-option ${responseData.status === 'resolved' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        value="resolved"
                        checked={responseData.status === 'resolved'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                      />
                      <span className="status-icon">🟢</span>
                      Resolved
                    </label>
                    <label className={`status-option ${responseData.status === 'closed' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        value="closed"
                        checked={responseData.status === 'closed'}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
                      />
                      <span className="status-icon">⚫</span>
                      Closed
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="responseMessage">
                    Your Response to Student (Optional)
                    {responseData.message.length > 0 && (
                      <span className="char-counter-small">
                        {' '}({responseData.message.length}/1000)
                      </span>
                    )}
                  </label>
                  <textarea
                    id="responseMessage"
                    placeholder="Add a response for the student..."
                    value={responseData.message}
                    onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                    rows={4}
                    className="response-textarea"
                    maxLength={1000}
                  />
                  {responseData.message.length > 1000 && (
                    <span className="char-error" style={{ fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                      Response must be less than 1000 characters
                    </span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setRespondModal({ open: false, issue: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={submitResponse}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Update Issue'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIssues;
