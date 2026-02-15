import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { patientService } from '../../services/patientService';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await patientService.getHealthAnalytics();
      setAnalytics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
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
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Health Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Track your medication adherence and health insights
        </p>

        {error && (
          <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.5)' }}>
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-label">Adherence Rate</div>
            <div className="stat-card-value">{analytics?.adherenceRate ?? 0}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Doses Taken</div>
            <div className="stat-card-value">{analytics?.dosesTaken ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Missed Doses</div>
            <div className="stat-card-value">{analytics?.missedDoses ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Active Reminders</div>
            <div className="stat-card-value">{analytics?.activeReminders ?? 0}</div>
          </div>
        </div>

        <div className="card mt-4">
          <h2 className="mb-4">Weekly Trend</h2>
          {(analytics?.weeklyTrend || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p>No data available</p>
            </div>
          ) : (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.weeklyTrend}>
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#9ca3af" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      background: '#131829',
                      border: '1px solid #2d3748',
                      color: '#ffffff'
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="adherence" stroke="#00d9a5" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="taken" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="missed" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
