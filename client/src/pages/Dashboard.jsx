import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, issueAPI, requestAPI, issueReportAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    myIssuedBooks: 0,
    allIssuedBooks: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentIssues, setRecentIssues] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [issueStats, setIssueStats] = useState(null);
  const [requestStats, setRequestStats] = useState(null);

  useEffect(() => {
    fetchStats();
    if (user.role === 'admin') {
      fetchAdminData();
    }
  }, [user.role]);

  const fetchStats = async () => {
    try {
      const [booksRes, myIssuesRes, allIssuesRes] = await Promise.all([
        bookAPI.getAllBooks(),
        user.role === 'student' ? issueAPI.getMyIssuedBooks() : Promise.resolve({ data: { issuedBooks: [] } }),
        user.role === 'admin' ? issueAPI.getAllIssuedBooks() : Promise.resolve({ data: { issuedBooks: [] } })
      ]);

      const books = booksRes.data.books || [];
      const totalBooks = books.length;
      const availableBooks = books.filter(b => b.quantity > 0).length;
      const myIssuedBooks = user.role === 'student' ? (myIssuesRes.data.issuedBooks || []).filter(ib => !ib.return_date).length : 0;
      const allIssuedBooks = user.role === 'admin' ? (allIssuesRes.data.issuedBooks || []).filter(ib => !ib.return_date).length : 0;

      setStats({
        totalBooks,
        availableBooks,
        myIssuedBooks,
        allIssuedBooks
      });
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch recent issues and requests in parallel
      const [issuesRes, requestsRes, issueStatsRes, requestStatsRes] = await Promise.allSettled([
        issueReportAPI.getAllIssues('open', null),
        requestAPI.getAllRequests('pending'),
        issueReportAPI.getIssueStats(),
        requestAPI.getRequestStats()
      ]);

      // Handle issues
      if (issuesRes.status === 'fulfilled' && issuesRes.value?.data?.success !== false) {
        const issues = issuesRes.value.data.issues || [];
        // Get top 5 most urgent issues (urgent first, then by date)
        const sortedIssues = issues
          .sort((a, b) => {
            const urgencyOrder = { urgent: 1, high: 2, normal: 3, low: 4 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            }
            return new Date(b.created_at) - new Date(a.created_at);
          })
          .slice(0, 5);
        setRecentIssues(sortedIssues);
      }

      // Handle issue stats
      if (issueStatsRes.status === 'fulfilled' && issueStatsRes.value?.data?.success !== false) {
        setIssueStats(issueStatsRes.value.data.stats);
      }

      // Handle requests
      if (requestsRes.status === 'fulfilled' && requestsRes.value?.data?.requests) {
        const requests = requestsRes.value.data.requests || [];
        // Get 5 most recent pending requests
        const sortedRequests = requests
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentRequests(sortedRequests);
      }

      // Handle request stats
      if (requestStatsRes.status === 'fulfilled' && requestStatsRes.value?.data?.stats) {
        setRequestStats(requestStatsRes.value.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Don't show errors - just leave empty
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const currentTime = new Date();
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="welcome-content">
            <h1 className="welcome-title">
              {greeting}, <span className="user-name">{user.name}</span>! 👋
            </h1>
            <p className="dashboard-subtitle">
              {user.role === 'admin' 
                ? 'Manage your library efficiently and keep track of all activities' 
                : 'Explore our vast collection and manage your reading journey'}
            </p>
            <div className="user-badge">
              <span className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? '👨‍💼 Administrator' : '👨‍🎓 Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-section">
          <h2 className="section-title">📊 Library Statistics</h2>
          <div className="dashboard-stats">
            <div className="stat-card stat-primary">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">📚</div>
              </div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.totalBooks}</h3>
                <p className="stat-label">Total Books</p>
                <div className="stat-trend">
                  <span className="trend-up">All books in library</span>
                </div>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">✅</div>
              </div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.availableBooks}</h3>
                <p className="stat-label">Available Books</p>
                <div className="stat-trend">
                  <span className="trend-up">Ready to borrow</span>
                </div>
              </div>
            </div>

            {user.role === 'student' ? (
              <div className="stat-card stat-warning">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">📖</div>
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{stats.myIssuedBooks}</h3>
                  <p className="stat-label">My Issued Books</p>
                  <div className="stat-trend">
                    <span className="trend-up">Currently reading</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="stat-card stat-info">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">📋</div>
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{stats.allIssuedBooks}</h3>
                  <p className="stat-label">Active Issues</p>
                  <div className="stat-trend">
                    <span className="trend-up">Books on loan</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin: Recent Issues and Requests */}
        {user.role === 'admin' && (
          <div className="admin-sections">
            {/* Reported Issues Section */}
            <div className="admin-section">
              <div className="section-header">
                <h2 className="section-title">⚠️ Recent Issues</h2>
                <Link to="/admin-issues" className="view-all-link">
                  View All →
                </Link>
              </div>
              {issueStats && (
                <div className="mini-stats">
                  <div className="mini-stat">
                    <span className="mini-stat-number">{issueStats.open || 0}</span>
                    <span className="mini-stat-label">Open</span>
                  </div>
                  {issueStats.urgent_pending > 0 && (
                    <div className="mini-stat urgent">
                      <span className="mini-stat-number">⚠️ {issueStats.urgent_pending}</span>
                      <span className="mini-stat-label">Urgent</span>
                    </div>
                  )}
                </div>
              )}
              {recentIssues.length > 0 ? (
                <div className="items-list">
                  {recentIssues.map((issue) => (
                    <Link 
                      key={issue.id} 
                      to="/admin-issues" 
                      className={`dashboard-item ${issue.urgency === 'urgent' ? 'urgent-item' : ''}`}
                    >
                      <div className="item-content">
                        <div className="item-header">
                          <h4 className="item-title">{issue.subject}</h4>
                          <span className={`urgency-badge urgency-${issue.urgency}`}>
                            {issue.urgency === 'urgent' ? '🔴' : issue.urgency === 'high' ? '🟠' : issue.urgency === 'normal' ? '🟡' : '🟢'} {issue.urgency}
                          </span>
                        </div>
                        <p className="item-meta">
                          <span className="item-reporter">👤 {issue.user_name}</span>
                          <span className="item-date">
                            {new Date(issue.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </p>
                        <p className="item-preview">{issue.message.substring(0, 100)}...</p>
                      </div>
                      <div className="item-arrow">→</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-section">
                  <p>No pending issues at the moment</p>
                </div>
              )}
            </div>

            {/* Book Requests Section */}
            <div className="admin-section">
              <div className="section-header">
                <h2 className="section-title">📬 Book Requests</h2>
                <Link to="/requests" className="view-all-link">
                  View All →
                </Link>
              </div>
              {requestStats && (
                <div className="mini-stats">
                  <div className="mini-stat">
                    <span className="mini-stat-number">{requestStats.pending || 0}</span>
                    <span className="mini-stat-label">Pending</span>
                  </div>
                </div>
              )}
              {recentRequests.length > 0 ? (
                <div className="items-list">
                  {recentRequests.map((request) => (
                    <Link 
                      key={request.id} 
                      to="/requests" 
                      className="dashboard-item"
                    >
                      <div className="item-content">
                        <div className="item-header">
                          <h4 className="item-title">{request.book_title || 'Book Request'}</h4>
                          <span className="status-badge badge-pending">
                            ⏳ Pending
                          </span>
                        </div>
                        <p className="item-meta">
                          <span className="item-reporter">👤 {request.user_name}</span>
                          <span className="item-date">
                            {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </p>
                        <p className="item-preview">{request.message.substring(0, 100)}...</p>
                      </div>
                      <div className="item-arrow">→</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-section">
                  <p>No pending book requests at the moment</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="actions-section">
          <h2 className="section-title">⚡ Quick Actions</h2>
          <div className="dashboard-actions">
            <Link to="/books" className="action-card action-primary">
              <div className="action-icon-wrapper">
                <div className="action-icon">🔍</div>
              </div>
              <div className="action-content">
                <h3>Browse Books</h3>
                <p>Explore the library collection and discover new books</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>

            {user.role === 'admin' ? (
              <>
                <Link to="/add-book" className="action-card action-success">
                  <div className="action-icon-wrapper">
                    <div className="action-icon">➕</div>
                  </div>
                  <div className="action-content">
                    <h3>Add Book</h3>
                    <p>Add a new book to the library collection</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>
                <Link to="/issue-book" className="action-card action-info">
                  <div className="action-icon-wrapper">
                    <div className="action-icon">📝</div>
                  </div>
                  <div className="action-content">
                    <h3>Manage Issues</h3>
                    <p>View and manage all book issues and returns</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>
              </>
            ) : (
              <Link to="/issue-book" className="action-card action-warning">
                <div className="action-icon-wrapper">
                  <div className="action-icon">📚</div>
                </div>
                <div className="action-content">
                  <h3>Issue Book</h3>
                  <p>Issue or return books from the library</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
