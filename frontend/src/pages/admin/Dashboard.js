import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { adminService } from '../../services/adminService';
import { ShieldCheck, Users, FileText, Bell, Package, RefreshCw, Settings } from 'lucide-react';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data || {});
      setError('');
    } catch (err) {
      setError('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
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

  const recentUsers = stats?.recentUsers || [];
  const recentRefills = stats?.recentPendingRefillRequests || stats?.recentRefillRequests || [];

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              System-wide control center with full CRUD oversight
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-outline" onClick={fetchDashboard}>
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/control-center')}>
              <Settings size={16} />
              Open Control Center
            </button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.4)' }}>
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Total Users</div>
                <div className="stat-card-value">{stats?.totalUsers || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(0, 217, 165, 0.12)' }}>
                <Users color="#00d9a5" size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Total Prescriptions</div>
                <div className="stat-card-value">{stats?.totalPrescriptions || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                <FileText color="#3b82f6" size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Inventory Items</div>
                <div className="stat-card-value">{stats?.totalInventoryItems || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                <Package color="#f59e0b" size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Pending Refill Requests</div>
                <div className="stat-card-value">{stats?.pendingRefillRequests || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.12)' }}>
                <ShieldCheck color="#8b5cf6" size={22} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>User Distribution</h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Patients</span>
                <strong>{stats?.patients || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Doctors</span>
                <strong>{stats?.doctors || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pharmacists</span>
                <strong>{stats?.pharmacists || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Admins</span>
                <strong>{stats?.admins || 0}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Notification Overview</h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Notifications</span>
                <strong>{stats?.totalNotifications || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Unread Notifications</span>
                <strong>{stats?.unreadNotifications || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Dose Logs</span>
                <strong>{stats?.totalDoseLogs || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Reminders</span>
                <strong>{stats?.activeReminders || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Recent Users</h2>
            {recentUsers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No users yet.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600 }}>{user.name || user.email}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {user.email} | {user.role || 'UNASSIGNED'} | {formatDateTime(user.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Pending Refill Requests</h2>
            {recentRefills.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No pending refill requests.</p>
            ) : (
              recentRefills.map((request) => (
                <div key={request.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600 }}>
                    {request.patient?.name || 'Patient'} -> {request.pharmacist?.name || 'Pharmacist'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {request.status} | {formatDateTime(request.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Quick Links</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/admin/control-center')}>
                <Settings size={16} />
                Manage All Records
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/admin/profile')}>
                <Bell size={16} />
                Update Admin Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
