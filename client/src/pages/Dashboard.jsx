import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, issueAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    myIssuedBooks: 0,
    allIssuedBooks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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
