import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientSetup = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    emergencyContact: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateProfile({
        role: 'PATIENT',
        ...formData,
      });
      navigate('/patient/dashboard');
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

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            flex: 1,
            height: '4px',
            background: step >= 1 ? 'var(--accent-teal)' : 'var(--border-color)',
            borderRadius: '4px',
            transition: 'background 0.3s ease'
          }}></div>
          <div style={{
            flex: 1,
            height: '4px',
            background: step >= 2 ? 'var(--accent-teal)' : 'var(--border-color)',
            borderRadius: '4px',
            transition: 'background 0.3s ease'
          }}></div>
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

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Basic Information
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Help us personalize your experience
              </p>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="input"
                  placeholder="dd-mm-yyyy"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Address</label>
                <textarea
                  name="address"
                  className="input"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
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
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary flex-1"
                  style={{ justifyContent: 'center' }}
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Medical Information
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                This helps us provide better care recommendations
              </p>

              <div className="input-group">
                <label className="input-label">Medical History</label>
                <textarea
                  name="medicalHistory"
                  className="input"
                  placeholder="Any existing conditions, past surgeries, etc."
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Allergies</label>
                <textarea
                  name="allergies"
                  className="input"
                  placeholder="List any known allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  className="input"
                  placeholder="Name and phone number"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={handleBack}
                  style={{ justifyContent: 'center' }}
                >
                  <ArrowLeft size={20} />
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
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PatientSetup;
