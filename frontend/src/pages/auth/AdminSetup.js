import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSetup = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
  });

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateProfile({
        role: 'ADMIN',
        ...formData,
      });
      navigate('/admin/dashboard');
    } catch (err) {
      const apiMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message;
      setError(apiMessage || 'Failed to complete setup. Please try again.');
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
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '560px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'rgba(0, 217, 165, 0.1)',
            marginBottom: '1rem'
          }}>
            <Activity size={32} color="#00d9a5" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Setup</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure your administrator account to manage all Medtracker data.
          </p>
        </div>

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
            <label className="input-label">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              className="input"
              placeholder="+1 (555) 000-0000"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Address</label>
            <textarea
              name="address"
              className="input"
              rows={3}
              placeholder="Office address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline flex-1"
              style={{ justifyContent: 'center' }}
              onClick={() => navigate('/role-selection')}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              style={{ justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSetup;
