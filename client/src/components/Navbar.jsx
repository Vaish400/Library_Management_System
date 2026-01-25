import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">📚</span>
          Library Management
        </Link>
        
        <div className="navbar-menu">
          <Link 
            to="/dashboard" 
            className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/books" 
            className={`navbar-link ${isActive('/books') ? 'active' : ''}`}
          >
            Books
          </Link>
          {user?.role === 'admin' && (
            <Link 
              to="/add-book" 
              className={`navbar-link ${isActive('/add-book') ? 'active' : ''}`}
            >
              Add Book
            </Link>
          )}
          <Link 
            to="/issue-book" 
            className={`navbar-link ${isActive('/issue-book') ? 'active' : ''}`}
          >
            {user?.role === 'admin' ? 'Manage Issues' : 'Issue Book'}
          </Link>
          {user?.role === 'admin' ? (
            <>
              <Link 
                to="/requests" 
                className={`navbar-link ${isActive('/requests') ? 'active' : ''}`}
              >
                📬 Book Requests
              </Link>
              <Link 
                to="/admin-issues" 
                className={`navbar-link ${isActive('/admin-issues') ? 'active' : ''}`}
              >
                ⚠️ Issues
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/request" 
                className={`navbar-link ${isActive('/request') ? 'active' : ''}`}
              >
                📝 Submit Request
              </Link>
              <Link 
                to="/my-requests" 
                className={`navbar-link ${isActive('/my-requests') ? 'active' : ''}`}
              >
                📋 My Requests
              </Link>
              <Link 
                to="/my-issues" 
                className={`navbar-link ${isActive('/my-issues') ? 'active' : ''}`}
              >
                ⚠️ My Issues
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student'}</span>
          </span>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
