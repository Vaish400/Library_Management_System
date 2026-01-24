import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.requestOTP(email);
      // Check if OTP is in response (development mode - email not configured)
      if (response.data.otp) {
        setMessage(`OTP: ${response.data.otp} (Email not configured - shown for development)`);
        setStep(2);
      } else {
        const emailMsg = response.data.email 
          ? `OTP sent to ${response.data.email}`
          : response.data.message || 'OTP sent to your email';
        setMessage(emailMsg);
        setStep(2);
      }
    } catch (err) {
      const errorData = err.response?.data || {};
      let errorMsg = errorData.message || errorData.error || 'Failed to send OTP';
      
      // Handle database connection errors with user-friendly message
      if (errorData.code === 'ER_ACCESS_DENIED_ERROR' || errorMsg.includes('Access denied')) {
        errorMsg = 'Database connection failed. Please check server configuration.';
      } else if (errorMsg.includes('Database connection error')) {
        errorMsg = 'Unable to connect to database. Please ensure MySQL is running and configured correctly.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(email, otp);
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>📚 Library Management</h1>
          <p>Secure Login with OTP</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        {step === 2 && message && message.includes('OTP:') && (
          <div className="alert alert-info" style={{ marginTop: '10px' }}>
            <strong>Development Mode:</strong> Email not configured. Use the OTP shown above.
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <div className="input-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                autoFocus
              />
              <p className="otp-hint">Check your email for the OTP code</p>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setMessage('');
              }}
              className="btn btn-secondary"
              style={{ marginTop: '12px', width: '100%' }}
            >
              Back to Email
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
