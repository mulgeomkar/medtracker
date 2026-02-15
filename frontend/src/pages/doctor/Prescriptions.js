import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { doctorService } from '../../services/doctorService';
import { Plus, FileText } from 'lucide-react';

const emptyMedication = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  timeOfDay: '',
  instructions: ''
};

const Prescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    patientId: '',
    diagnosis: '',
    notes: '',
    refillLimit: 0,
    validUntil: '',
    medications: [{ ...emptyMedication }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsResponse, prescriptionsResponse] = await Promise.all([
        doctorService.getPatients(),
        doctorService.getPrescriptions()
      ]);
      setPatients(patientsResponse.data || []);
      setPrescriptions(prescriptionsResponse.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load prescription data.');
    } finally {
      setLoading(false);
    }
  };

  const updateMedication = (index, field, value) => {
    const next = [...form.medications];
    next[index] = { ...next[index], [field]: value };
    setForm((prev) => ({ ...prev, medications: next }));
  };

  const addMedication = () => {
    setForm((prev) => ({ ...prev, medications: [...prev.medications, { ...emptyMedication }] }));
  };

  const removeMedication = (index) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, idx) => idx !== index)
    }));
  };

  const validateForm = () => {
    if (!form.patientId) return 'Please select a patient.';
    if (form.medications.length === 0 || !form.medications[0].name.trim()) return 'At least one medication is required.';
    return '';
  };

  const submitPrescription = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');
      await doctorService.createPrescription({
        patient: { id: form.patientId },
        diagnosis: form.diagnosis,
        notes: form.notes,
        refillLimit: Number(form.refillLimit || 0),
        refillsRemaining: Number(form.refillLimit || 0),
        validUntil: form.validUntil ? `${form.validUntil}T23:59:00` : null,
        medications: form.medications
      });
      setMessage('Prescription created and sent to patient.');
      setForm({
        patientId: '',
        diagnosis: '',
        notes: '',
        refillLimit: 0,
        validUntil: '',
        medications: [{ ...emptyMedication }]
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data || 'Failed to create prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Doctor Prescriptions</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Create prescriptions and send directly to patient accounts
        </p>

        {message && <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(16,185,129,0.4)' }}>{message}</div>}
        {error && <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.4)' }}>{error}</div>}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create Prescription</h2>
          <form onSubmit={submitPrescription}>
            <div className="input-group">
              <label className="input-label">Patient</label>
              <select className="input" value={form.patientId} onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}>
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Diagnosis</label>
                <input className="input" value={form.diagnosis} onChange={(e) => setForm((prev) => ({ ...prev, diagnosis: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Refill Limit</label>
                <input className="input" type="number" min="0" value={form.refillLimit} onChange={(e) => setForm((prev) => ({ ...prev, refillLimit: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Valid Until</label>
                <input className="input" type="date" value={form.validUntil} onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))} />
              </div>
            </div>

            {form.medications.map((medication, index) => (
              <div key={index} className="card" style={{ padding: '1rem', marginBottom: '0.75rem', borderColor: 'rgba(59,130,246,0.25)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <input className="input" placeholder="Medication name" value={medication.name} onChange={(e) => updateMedication(index, 'name', e.target.value)} />
                  <input className="input" placeholder="Dosage" value={medication.dosage} onChange={(e) => updateMedication(index, 'dosage', e.target.value)} />
                  <input className="input" placeholder="Frequency" value={medication.frequency} onChange={(e) => updateMedication(index, 'frequency', e.target.value)} />
                  <input className="input" placeholder="Duration" value={medication.duration} onChange={(e) => updateMedication(index, 'duration', e.target.value)} />
                  <input className="input" placeholder="Time of day" value={medication.timeOfDay} onChange={(e) => updateMedication(index, 'timeOfDay', e.target.value)} />
                  <input className="input" placeholder="Instructions" value={medication.instructions} onChange={(e) => updateMedication(index, 'instructions', e.target.value)} />
                </div>
                {form.medications.length > 1 && (
                  <button type="button" className="btn btn-secondary mt-2" onClick={() => removeMedication(index)}>
                    Remove Medication
                  </button>
                )}
              </div>
            ))}

            <div className="input-group">
              <label className="input-label">Notes / Digital signature</label>
              <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Doctor notes and approval details" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline" onClick={addMedication}>
                <Plus size={16} />
                Add Medication
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Create Prescription'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Prescriptions</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner"></div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>No prescriptions created yet.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Medications</th>
                    <th>Refills</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>{prescription.patient?.name || '-'}</td>
                      <td>{(prescription.medications || []).map((medication) => medication.name).join(', ') || '-'}</td>
                      <td>{prescription.refillsRemaining ?? 0}</td>
                      <td>{prescription.status}</td>
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

export default Prescriptions;
