import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Password has been reset successfully.');

  useEffect(() => {
    // Ensure stale sessions are cleared when entering reset flow.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.resetPassword(token, formData.newPassword);
      setSuccessMessage(response.data?.message || 'Password has been reset successfully.');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const apiMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message;
      setError(apiMessage || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--primary-bg)',
      padding: '2rem'
    }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Set new password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter and confirm your new password
          </p>
        </div>

        {success ? (
          <div style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={20} />
              <strong>Password updated</strong>
            </div>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.9rem' }}>
              {successMessage}
            </p>
            <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--error)',
                fontSize: '0.875rem'
              }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">
                <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                New Password
              </label>
              <input
                type="password"
                className="input"
                name="newPassword"
                placeholder="Minimum 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Confirm Password
              </label>
              <input
                type="password"
                className="input"
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
