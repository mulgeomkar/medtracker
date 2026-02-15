import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PharmacistSetup = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    licenseNumber: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateProfile({
        role: 'PHARMACIST',
        ...formData,
      });
      navigate('/pharmacist/dashboard');
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
      padding: '2rem'
    }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            MedTracker
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Complete your profile
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

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Professional Details
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Verify your credentials
          </p>

          <div className="input-group">
            <label className="input-label">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              className="input"
              placeholder="Professional license number"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline flex-1"
              onClick={() => navigate('/role-selection')}
              style={{ justifyContent: 'center' }}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              style={{ justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Completing...' : 'Complete Setup'}
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PharmacistSetup;
