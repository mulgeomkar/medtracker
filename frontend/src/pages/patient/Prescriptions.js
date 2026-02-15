import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { patientService } from '../../services/patientService';
import { FileText, RefreshCw } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [prescriptionsResponse, refillsResponse] = await Promise.all([
        patientService.getPrescriptions(),
        patientService.getRefillRequests()
      ]);
      setPrescriptions(prescriptionsResponse.data || []);
      setRefills(refillsResponse.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch prescriptions.');
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRefillStatus = (prescriptionId) => {
    const latest = refills.find((refill) => refill.prescription?.id === prescriptionId);
    return latest?.status || 'NONE';
  };

  const canRequestRefill = (prescription) => {
    const status = getRefillStatus(prescription.id);
    return !['REQUESTED', 'PROCESSING', 'READY'].includes(status) && (prescription.refillsRemaining || 0) > 0;
  };

  const requestRefill = async (prescriptionId) => {
    try {
      await patientService.createRefillRequest(prescriptionId);
      setMessage('Refill request sent to pharmacist.');
      fetchData();
    } catch (err) {
      setError(err.response?.data || 'Failed to create refill request.');
    }
  };

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>My Prescriptions</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          View prescriptions and request refills
        </p>

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
          ) : prescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No prescriptions yet</p>
              <p style={{ fontSize: '0.875rem' }}>Your doctor-issued prescriptions will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.25rem' }}>
                        Dr. {prescription.doctor?.name || 'Assigned Doctor'}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Diagnosis: {prescription.diagnosis || 'N/A'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span className={`badge badge-${prescription.status === 'ACTIVE' ? 'success' : 'info'}`}>
                        {prescription.status}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Refills left: {prescription.refillsRemaining || 0}
                      </span>
                    </div>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(prescription.medications || []).map((medication, idx) => (
                          <tr key={`${prescription.id}-${idx}`}>
                            <td>{medication.name}</td>
                            <td>{medication.dosage}</td>
                            <td>{medication.frequency}</td>
                            <td>{medication.duration}</td>
                            <td>{medication.instructions || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Refill status: {getRefillStatus(prescription.id)}
                    </span>
                    <button
                      className="btn btn-outline"
                      onClick={() => requestRefill(prescription.id)}
                      disabled={!canRequestRefill(prescription)}
                    >
                      <RefreshCw size={16} />
                      Request Refill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Prescriptions;
