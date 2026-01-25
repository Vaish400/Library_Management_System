import { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import IssueBook from './pages/IssueBook';
import BookDetails from './pages/BookDetails';
import { authAPI } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Verify token is still valid
        authAPI.getCurrentUser()
          .then(response => {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          })
          .catch(() => {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // GitHub Pages doesn’t support SPA refresh on BrowserRouter paths.
  // Use HashRouter automatically on github.io so the deployed UI works.
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
  const Router = isGitHubPages ? HashRouter : BrowserRouter;

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Register />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard user={user} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/books" 
            element={
              user ? <Books user={user} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/books/:id" 
            element={
              user ? <BookDetails user={user} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/add-book" 
            element={
              user?.role === 'admin' ? <AddBook /> : <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/issue-book" 
            element={
              user ? <IssueBook user={user} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
