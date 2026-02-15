import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { doctorService } from '../../services/doctorService';

const dayLabel = (date) => date.toLocaleDateString(undefined, { weekday: 'short' });

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsResponse, prescriptionsResponse] = await Promise.all([
        doctorService.getPracticeAnalytics(),
        doctorService.getPrescriptions()
      ]);
      setAnalytics(analyticsResponse.data || {});
      setPrescriptions(prescriptionsResponse.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const weeklySeries = useMemo(() => {
    const today = new Date();
    const map = new Map();
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      map.set(date.toISOString().slice(0, 10), {
        day: dayLabel(date),
        date: date.toISOString().slice(0, 10),
        count: 0
      });
    }
    prescriptions.forEach((prescription) => {
      if (!prescription.createdAt) return;
      const key = new Date(prescription.createdAt).toISOString().slice(0, 10);
      if (map.has(key)) {
        map.get(key).count += 1;
      }
    });
    return Array.from(map.values());
  }, [prescriptions]);

  const medicationUsage = useMemo(() => {
    const counts = {};
    prescriptions.forEach((prescription) => {
      (prescription.medications || []).forEach((medication) => {
        if (!medication.name) return;
        counts[medication.name] = (counts[medication.name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, uses]) => ({ name, uses }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 6);
  }, [prescriptions]);

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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Doctor Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Live prescription and patient activity insights
        </p>

        {error && (
          <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.4)' }}>
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Patients</div>
            <div className="stat-card-value">{analytics?.totalPatients || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Active Prescriptions</div>
            <div className="stat-card-value">{analytics?.activePrescriptions || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Consultations</div>
            <div className="stat-card-value">{analytics?.consultations || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Estimated Revenue</div>
            <div className="stat-card-value">${analytics?.revenue || 0}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Weekly Prescription Trend</h2>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#131829',
                      border: '1px solid #2d3748',
                      color: '#ffffff'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#00d9a5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Top Prescribed Medications</h2>
            {medicationUsage.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No medication data yet.</p>
            ) : (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={medicationUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis type="number" stroke="#9ca3af" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} />
                    <Tooltip
                      contentStyle={{
                        background: '#131829',
                        border: '1px solid #2d3748',
                        color: '#ffffff'
                      }}
                    />
                    <Bar dataKey="uses" fill="#3b82f6" />
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
