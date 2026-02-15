import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import { User, Heart, Edit3, Save } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await patientService.getProfile();
      setProfile(response.data);
      setForm(response.data || {});
    } catch (err) {
      setError('Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleChange('profileImage', reader.result?.toString() || '');
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.name?.trim()) return 'Name is required.';
    if (!form.phoneNumber?.trim()) return 'Phone number is required.';
    if (form.phoneNumber && form.phoneNumber.length < 8) return 'Phone number is too short.';
    return '';
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');
      await patientService.updateProfile({
        name: form.name,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
        profileImage: form.profileImage
      });
      await patientService.updateMedicalInfo({
        medicalHistory: form.medicalHistory,
        allergies: form.allergies,
        emergencyContact: form.emergencyContact
      });
      setMessage('Profile updated successfully.');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Profile</h1>

        {message && (
          <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(16,185,129,0.4)' }}>
            {message}
          </div>
        )}
        {error && (
          <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.4)' }}>
            {error}
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="Profile"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'var(--primary-bg)'
                }}>
                  {(form.name || user?.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{form.name || user?.name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{profile?.email || user?.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {editing && (
                <label className="btn btn-secondary" style={{ margin: 0 }}>
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleUploadImage} hidden />
                </label>
              )}
              <button className="btn btn-outline" onClick={() => setEditing((prev) => !prev)}>
                <Edit3 size={16} />
                {editing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} color="#00d9a5" />
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" disabled={!editing} value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input" disabled={!editing} value={form.phoneNumber || ''} onChange={(e) => handleChange('phoneNumber', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Date of Birth</label>
                  <input className="input" type="date" disabled={!editing} value={form.dateOfBirth || ''} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Address</label>
                  <input className="input" disabled={!editing} value={form.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={20} color="#ef4444" />
                Medical Information
              </h3>
              <div className="input-group">
                <label className="input-label">Medical History</label>
                <textarea className="input" rows={3} disabled={!editing} value={form.medicalHistory || ''} onChange={(e) => handleChange('medicalHistory', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Allergies</label>
                <textarea className="input" rows={2} disabled={!editing} value={form.allergies || ''} onChange={(e) => handleChange('allergies', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Emergency Contact</label>
                <input className="input" disabled={!editing} value={form.emergencyContact || ''} onChange={(e) => handleChange('emergencyContact', e.target.value)} />
              </div>
            </div>

            {editing && (
              <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleSave} disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
