import { useState, useEffect } from 'react';
import { issueReportAPI } from '../services/api';
import './MyIssues.css';

const MyIssues = ({ user }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      const response = await issueReportAPI.getMyIssues();
      setIssues(response.data?.issues || []);
    } catch (error) {
      setIssues([]);
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
      <div className="my-issues-loading">
        <div className="loading-spinner"></div>
        <p>Loading your issues...</p>
      </div>
    );
  }

  return (
    <div className="my-issues-page">
      <div className="my-issues-container">
        <div className="my-issues-header">
          <h1 className="page-title">⚠️ My Reported Issues</h1>
          <p className="page-subtitle">
            Track the status of your reported issues
          </p>
        </div>

        {issues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No Issues Reported Yet</h2>
            <p>
              You haven't reported any issues yet. If you encounter any problems,
              you can report them from the Submit Request page.
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
                  <div className="your-message">
                    <span className="label">Your Description:</span>
                    <p className="message-text">"{issue.message}"</p>
                  </div>
                  
                  {issue.admin_response && (
                    <div className="admin-response">
                      <span className="label">Admin's Response:</span>
                      <p>"{issue.admin_response}"</p>
                      <span className="responded-by">
                        — {issue.admin_name || 'Admin'} • {formatDate(issue.responded_at)}
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

export default MyIssues;
