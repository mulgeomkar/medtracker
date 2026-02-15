import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { doctorService } from '../../services/doctorService';
import { Users } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setFilteredPatients(patients);
      return;
    }
    setFilteredPatients(
      patients.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(query) ||
          patient.email?.toLowerCase().includes(query)
      )
    );
  }, [search, patients]);

  const fetchPatients = async () => {
    try {
      const response = await doctorService.getPatients();
      setPatients(response.data || []);
      setFilteredPatients(response.data || []);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>My Patients</h1>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <input
            className="input"
            placeholder="Search patients by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No patients found</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Emergency Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.name || '-'}</td>
                      <td>{patient.email || '-'}</td>
                      <td>{patient.phoneNumber || '-'}</td>
                      <td>{patient.emergencyContact || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Patients;
