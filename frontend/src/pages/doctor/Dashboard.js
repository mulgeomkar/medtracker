import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { Users, FileText, TrendingUp, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const doctorName = user?.name || user?.email?.split('@')[0] || 'Doctor';

  const [stats, setStats] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, prescriptionsResponse] = await Promise.all([
        doctorService.getDashboardStats(),
        doctorService.getPrescriptions()
      ]);
      setStats(statsResponse.data);
      setPrescriptions((prescriptionsResponse.data || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch doctor dashboard', err);
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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, Dr. {doctorName}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Practice summary and prescription activity
        </p>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Total Patients</div>
                <div className="stat-card-value">{stats?.totalPatients || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <Users color="#3b82f6" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Active Prescriptions</div>
                <div className="stat-card-value">{stats?.activePrescriptions || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(0, 217, 165, 0.1)' }}>
                <FileText color="#00d9a5" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Pending Reviews</div>
                <div className="stat-card-value">{stats?.pendingReviews || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Calendar color="#f59e0b" size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">This Month</div>
                <div className="stat-card-value">{stats?.thisMonth || 0}</div>
              </div>
              <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <TrendingUp color="#8b5cf6" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="card mt-4">
            <h2 className="mb-4">Recent Prescriptions</h2>
            {prescriptions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No prescriptions yet.</p>
            ) : (
              prescriptions.map((prescription) => (
                <div key={prescription.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600 }}>{prescription.patient?.name || 'Patient'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {(prescription.medications || []).map((med) => med.name).filter(Boolean).join(', ') || 'No medications'}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card mt-4">
            <h2 className="mb-4">Quick Actions</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/doctor/prescriptions')}>
                <Plus size={20} />
                New Prescription
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/doctor/patients')}>
                <Users size={20} />
                View Patients
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate('/doctor/analytics')}>
                <TrendingUp size={20} />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
