import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout';
import { patientService } from '../../services/patientService';
import { Bell, Plus, X, CheckCircle2 } from 'lucide-react';

const defaultReminder = {
  medicineName: '',
  dosage: '',
  frequency: 'Daily',
  times: '09:00',
  startDate: '',
  endDate: '',
  instructions: ''
};

const frequencyOptions = ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'Custom'];

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newReminder, setNewReminder] = useState(defaultReminder);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const medicationOptions = useMemo(() => {
    const names = prescriptions.flatMap((prescription) =>
      (prescription.medications || []).map((medication) => medication.name).filter(Boolean)
    );
    return [...new Set(names)];
  }, [prescriptions]);

  const fetchData = async () => {
    try {
      const [remindersResponse, prescriptionsResponse] = await Promise.all([
        patientService.getReminders(),
        patientService.getPrescriptions()
      ]);
      setReminders(remindersResponse.data || []);
      setPrescriptions(prescriptionsResponse.data || []);
    } catch (err) {
      setError('Failed to load reminders.');
      console.error('Failed to fetch reminders data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setError('');
    setMessage('');
  };

  const closeModal = () => {
    setShowModal(false);
    setNewReminder(defaultReminder);
  };

  const handleChange = (field, value) => {
    setNewReminder((prev) => ({ ...prev, [field]: value }));
  };

  const maybeNotifyBrowser = (title, body) => {
    if (!('Notification' in window)) {
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
      return;
    }
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  };

  const handleCreateReminder = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!newReminder.medicineName.trim()) {
      setError('Medication name is required.');
      return;
    }
    if (!newReminder.dosage.trim()) {
      setError('Dosage is required.');
      return;
    }
    if (!newReminder.startDate) {
      setError('Start date is required.');
      return;
    }

    const times = newReminder.times
      .split(',')
      .map((time) => time.trim())
      .filter(Boolean);

    if (times.length === 0) {
      setError('At least one reminder time is required.');
      return;
    }

    const payload = {
      medicineName: newReminder.medicineName,
      dosage: newReminder.dosage,
      frequency: newReminder.frequency,
      times,
      startDate: `${newReminder.startDate}T00:00:00`,
      endDate: newReminder.endDate ? `${newReminder.endDate}T23:59:00` : null,
      instructions: newReminder.instructions
    };

    try {
      setSaving(true);
      await patientService.createReminder(payload);
      await fetchData();
      setMessage('Reminder created successfully.');
      maybeNotifyBrowser('Medication Reminder Added', `${newReminder.medicineName} has been scheduled.`);
      closeModal();
    } catch (err) {
      setError(err.response?.data || 'Unable to create reminder.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogDose = async (reminder) => {
    try {
      const now = new Date().toISOString().slice(0, 19);
      await patientService.logDose(reminder.id, { scheduledAt: now });
      setMessage(`Dose logged for ${reminder.medicineName}.`);
    } catch (err) {
      setError('Failed to log dose.');
    }
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Medication Reminders</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Never miss a dose</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={openModal}>
              <Plus size={20} />
              Add Reminder
            </button>
          </div>
        </div>

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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : reminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No reminders set</p>
              <button className="btn btn-primary mt-4" onClick={openModal}>
                <Plus size={20} />
                Create New Reminder
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reminders.map((reminder) => (
                <div key={reminder.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <h3>{reminder.medicineName}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {reminder.dosage} | {reminder.frequency} | {(reminder.times || []).join(', ')}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {reminder.instructions || 'No special instructions'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <span className="badge badge-success">Active</span>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleLogDose(reminder)}
                        style={{ padding: '0.45rem 0.75rem' }}
                      >
                        <CheckCircle2 size={16} />
                        Mark Taken
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">New Reminder</h2>
                <button className="modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateReminder}>
                <div className="input-group">
                  <label className="input-label">Medication</label>
                  <input
                    className="input"
                    list="medication-list"
                    value={newReminder.medicineName}
                    onChange={(e) => handleChange('medicineName', e.target.value)}
                    placeholder="Medication name"
                  />
                  <datalist id="medication-list">
                    {medicationOptions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                <div className="input-group">
                  <label className="input-label">Dosage</label>
                  <input
                    className="input"
                    value={newReminder.dosage}
                    onChange={(e) => handleChange('dosage', e.target.value)}
                    placeholder="e.g. 500mg"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Frequency</label>
                  <select
                    className="input"
                    value={newReminder.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                  >
                    {frequencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Time(s) of day</label>
                  <input
                    className="input"
                    value={newReminder.times}
                    onChange={(e) => handleChange('times', e.target.value)}
                    placeholder="09:00, 21:00"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Start date</label>
                    <input
                      className="input"
                      type="date"
                      value={newReminder.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">End date</label>
                    <input
                      className="input"
                      type="date"
                      value={newReminder.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Special instructions</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={newReminder.instructions}
                    onChange={(e) => handleChange('instructions', e.target.value)}
                    placeholder="Take with food, avoid dairy, etc."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Create Reminder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reminders;
