import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { pharmacistService } from '../../services/pharmacistService';
import { Edit3, Save, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await pharmacistService.getProfile();
      setProfile(response.data || {});
      setForm(response.data || {});
      setError('');
    } catch (err) {
      setError('Failed to load pharmacist profile.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.name?.trim()) return 'Name is required.';
    if (!form.licenseNumber?.trim()) return 'License number is required.';
    if (form.phoneNumber && form.phoneNumber.trim().length < 8) return 'Phone number looks too short.';
    return '';
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('profileImage', reader.result?.toString() || '');
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      await pharmacistService.updateProfile({
        name: form.name,
        phoneNumber: form.phoneNumber,
        licenseNumber: form.licenseNumber,
        address: form.address,
        profileImage: form.profileImage
      });
      setMessage('Profile updated successfully.');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pharmacist Profile</h1>

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {form.profileImage ? (
                <img src={form.profileImage} alt="Pharmacist" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--accent-blue)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '1.5rem'
                }}>
                  {(form.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{form.name || 'Pharmacist'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{profile?.email || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {editing && (
                <label className="btn btn-secondary" style={{ margin: 0 }}>
                  Upload Photo
                  <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                </label>
              )}
              <button className="btn btn-outline" onClick={() => setEditing((prev) => !prev)}>
                <Edit3 size={16} />
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" disabled={!editing} value={form.name || ''} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input className="input" disabled={!editing} value={form.phoneNumber || ''} onChange={(e) => setField('phoneNumber', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">License Number</label>
              <input className="input" disabled={!editing} value={form.licenseNumber || ''} onChange={(e) => setField('licenseNumber', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Address</label>
              <input className="input" disabled={!editing} value={form.address || ''} onChange={(e) => setField('address', e.target.value)} />
            </div>
          </div>

          {editing && (
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          {!editing && (
            <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} />
              Profile updates sync to your pharmacist dashboard account.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
