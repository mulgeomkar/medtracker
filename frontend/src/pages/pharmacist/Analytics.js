import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { pharmacistService } from '../../services/pharmacistService';

const colors = ['#00d9a5', '#f59e0b', '#ef4444', '#3b82f6'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsResponse, inventoryResponse, ordersResponse] = await Promise.all([
        pharmacistService.getInventoryAnalytics(),
        pharmacistService.getInventory(),
        pharmacistService.getPendingOrders()
      ]);
      setAnalytics(analyticsResponse.data || {});
      setInventory(inventoryResponse.data || []);
      setOrders(ordersResponse.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load pharmacist analytics.');
    } finally {
      setLoading(false);
    }
  };

  const stockDistribution = useMemo(() => {
    const counts = {};
    inventory.forEach((item) => {
      const status = item.status || 'IN_STOCK';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const refillStatus = useMemo(() => {
    const counts = {};
    orders.forEach((order) => {
      const status = order.status || 'REQUESTED';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, total]) => ({ status, total }));
  }, [orders]);

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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Pharmacist Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Live inventory and refill request performance
        </p>

        {error && (
          <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.4)' }}>
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Inventory Items</div>
            <div className="stat-card-value">{analytics?.totalItems || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Total Inventory Value</div>
            <div className="stat-card-value">${Math.round(analytics?.totalValue || 0)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Low Stock Items</div>
            <div className="stat-card-value">{analytics?.lowStockItems || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Expiring Items</div>
            <div className="stat-card-value">{analytics?.expiringItems || 0}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Inventory Stock Status</h2>
            {stockDistribution.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No inventory data yet.</p>
            ) : (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockDistribution} dataKey="value" nameKey="name" outerRadius={90} label>
                      {stockDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#131829',
                        border: '1px solid #2d3748',
                        color: '#ffffff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Refill Request Status</h2>
            {refillStatus.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No refill requests yet.</p>
            ) : (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={refillStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="status" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#131829',
                        border: '1px solid #2d3748',
                        color: '#ffffff'
                      }}
                    />
                    <Bar dataKey="total" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
