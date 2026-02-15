import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { Package, AlertTriangle, Clock3, TrendingUp, ScanLine, ClipboardList, BarChart3, User, BellRing, CheckCircle2 } from 'lucide-react';
import { pharmacistService } from '../../services/pharmacistService';

const pendingStatuses = ['REQUESTED', 'PROCESSING', 'READY'];
const statusFlow = ['REQUESTED', 'PROCESSING', 'READY', 'DISPENSED', 'REJECTED'];

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, ordersResponse, notificationsResponse] = await Promise.all([
        pharmacistService.getDashboardStats(),
        pharmacistService.getPendingOrders(),
        pharmacistService.getNotifications()
      ]);
      setStats(statsResponse.data || {});
      setOrders(ordersResponse.data || []);
      setNotifications(notificationsResponse.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load pharmacist dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = useMemo(
    () => orders.filter((order) => pendingStatuses.includes(order.status)),
    [orders]
  );

  const recentNotifications = useMemo(() => notifications.slice(0, 6), [notifications]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await pharmacistService.fulfillOrder(orderId, { status });
      setMessage(`Order moved to ${status}.`);
      fetchData();
    } catch (err) {
      setError('Failed to update order status.');
    }
  };

  const markRead = async (notificationId) => {
    try {
      await pharmacistService.markNotificationRead(notificationId);
      fetchData();
    } catch (err) {
      setError('Failed to mark notification as read.');
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
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Pharmacist Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Inventory, refill requests, and fulfillment updates
          </p>
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

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Total Inventory Items</div>
                <div className="stat-card-value">{stats?.totalItems || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <Package color="#3b82f6" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Low Stock Alerts</div>
                <div className="stat-card-value">{stats?.lowStockAlerts || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertTriangle color="#ef4444" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Pending Fulfillment</div>
                <div className="stat-card-value">{pendingOrders.length}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Clock3 color="#f59e0b" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Unread Notifications</div>
                <div className="stat-card-value">{stats?.unreadNotifications || 0}</div>
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
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Pending Refill Requests</h2>
            {pendingOrders.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No pending refill requests.</p>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{order.patient?.name || 'Patient'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {formatDateTime(order.createdAt)} | Status: {order.status}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        Prescription: {order.prescription?.id || 'N/A'} {order.note ? `| Note: ${order.note}` : ''}
                      </div>
                    </div>
                    <select
                      className="input"
                      style={{ minWidth: 120, width: '100%', maxWidth: 160 }}
                      value={order.status}
                      onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                    >
                      {statusFlow.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Notifications</h2>
            {recentNotifications.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
            ) : (
              recentNotifications.map((notification) => (
                <div key={notification.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <BellRing size={14} />
                        {notification.title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {notification.message}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                        {formatDateTime(notification.createdAt)}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.5rem' }}
                        onClick={() => markRead(notification.id)}
                      >
                        <CheckCircle2 size={14} />
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            <button className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/pharmacist/inventory')}>
              <ScanLine size={20} />
              Add Inventory Item
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/pharmacist/inventory')}>
              <ClipboardList size={20} />
              Fulfill Orders
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/pharmacist/analytics')}>
              <BarChart3 size={20} />
              View Analytics
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/pharmacist/profile')}>
              <User size={20} />
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
