import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { patientService } from '../../services/patientService';
import { Bell, FileText, Heart, TrendingUp, Plus, Eye, Clock } from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, remindersResponse, notificationsResponse] = await Promise.all([
        patientService.getDashboardStats(),
        patientService.getReminders(),
        patientService.getNotifications()
      ]);
      setStats(statsResponse.data);
      setReminders(remindersResponse.data || []);
      setNotifications((notificationsResponse.data || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Good Morning, {stats?.patientName || 'Patient'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here is your live health summary
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Active Medications</div>
                <div className="stat-card-value">{stats?.activeMedications || 0}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Currently prescribed
                </div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(0, 217, 165, 0.1)' }}>
                <FileText color="#00d9a5" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Due Medications</div>
                <div className="stat-card-value">{stats?.dueMedications || 0}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Scheduled today
                </div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Clock color="#f59e0b" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Missed Doses</div>
                <div className="stat-card-value">{stats?.missedDoses || 0}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Today
                </div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <Bell color="#ef4444" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Adherence Rate</div>
                <div className="stat-card-value">{stats?.adherenceRate || 0}%</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Last 7 days
                </div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <TrendingUp color="#8b5cf6" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Today Schedule</h2>
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/patient/reminders')}>
                <Plus size={16} />
                Add Reminder
              </button>
            </div>

            {reminders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                <Bell size={42} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No reminders for today</p>
              </div>
            ) : (
              reminders.slice(0, 4).map((reminder) => (
                <div key={reminder.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600 }}>{reminder.medicineName}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {(reminder.times || []).join(', ')} | {reminder.dosage}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Updates</h2>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                <Heart size={42} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No recent notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600 }}>{notification.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{notification.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/patient/prescriptions')}>
              <FileText size={20} color="#00d9a5" />
              View Prescriptions
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/patient/reminders')}>
              <Bell size={20} color="#f59e0b" />
              Set Reminder
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/patient/analytics')}>
              <TrendingUp size={20} color="#8b5cf6" />
              View Analytics
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/patient/profile')}>
              <Eye size={20} color="#3b82f6" />
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
