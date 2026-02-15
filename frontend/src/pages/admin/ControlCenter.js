import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout';
import { adminService } from '../../services/adminService';
import { RefreshCw, Save, Plus, Edit3, Trash2 } from 'lucide-react';

const initialRecords = {
  users: [],
  prescriptions: [],
  reminders: [],
  inventory: [],
  refills: [],
  doseLogs: [],
  notifications: [],
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object' && value.id) return String(value.id).trim();
  return '';
};

const normalizePayload = (tab, input) => {
  const payload = { ...input };

  if (tab === 'users') {
    return {
      ...payload,
      name: typeof payload.name === 'string' ? payload.name.trim() : payload.name,
      email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : payload.email,
      role: typeof payload.role === 'string' ? payload.role.trim().toUpperCase() : payload.role,
      phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber.trim() : payload.phoneNumber,
      dateOfBirth: typeof payload.dateOfBirth === 'string' ? payload.dateOfBirth.trim() : payload.dateOfBirth,
      address: typeof payload.address === 'string' ? payload.address.trim() : payload.address,
      licenseNumber: typeof payload.licenseNumber === 'string' ? payload.licenseNumber.trim() : payload.licenseNumber,
      specialization: typeof payload.specialization === 'string' ? payload.specialization.trim() : payload.specialization,
      medicalHistory: typeof payload.medicalHistory === 'string' ? payload.medicalHistory.trim() : payload.medicalHistory,
      allergies: typeof payload.allergies === 'string' ? payload.allergies.trim() : payload.allergies,
      emergencyContact: typeof payload.emergencyContact === 'string' ? payload.emergencyContact.trim() : payload.emergencyContact,
    };
  }

  if (tab === 'prescriptions') {
    const patientId = getId(payload.patient) || getId(payload.patientId);
    const doctorId = getId(payload.doctor) || getId(payload.doctorId);
    const medications = Array.isArray(payload.medications) ? payload.medications : [];
    return {
      ...payload,
      patient: { id: patientId },
      doctor: { id: doctorId },
      medications,
      status: typeof payload.status === 'string' ? payload.status.trim().toUpperCase() : payload.status,
    };
  }

  if (tab === 'reminders') {
    const patientId = getId(payload.patient) || getId(payload.patientId);
    const normalizedTimes = Array.isArray(payload.times)
      ? payload.times
      : typeof payload.times === 'string'
        ? payload.times.split(',').map((value) => value.trim()).filter(Boolean)
        : [];
    return {
      ...payload,
      patient: { id: patientId },
      times: normalizedTimes,
    };
  }

  if (tab === 'inventory') {
    const pharmacistId = getId(payload.pharmacist) || getId(payload.pharmacistId);
    return {
      ...payload,
      pharmacist: { id: pharmacistId },
      status: typeof payload.status === 'string' ? payload.status.trim().toUpperCase() : payload.status,
    };
  }

  if (tab === 'refills') {
    const patientId = getId(payload.patient) || getId(payload.patientId);
    const pharmacistId = getId(payload.pharmacist) || getId(payload.pharmacistId);
    const prescriptionId = getId(payload.prescription) || getId(payload.prescriptionId);
    return {
      ...payload,
      patient: { id: patientId },
      pharmacist: { id: pharmacistId },
      prescription: { id: prescriptionId },
      status: typeof payload.status === 'string' ? payload.status.trim().toUpperCase() : payload.status,
    };
  }

  if (tab === 'doseLogs') {
    const patientId = getId(payload.patient) || getId(payload.patientId);
    const reminderId = getId(payload.reminder) || getId(payload.reminderId);
    return {
      ...payload,
      patient: { id: patientId },
      reminder: { id: reminderId },
      status: typeof payload.status === 'string' ? payload.status.trim().toUpperCase() : payload.status,
    };
  }

  if (tab === 'notifications') {
    const recipientId = getId(payload.recipient) || getId(payload.recipientId);
    const senderId = getId(payload.sender) || getId(payload.senderId);
    return {
      ...payload,
      recipientId,
      senderId,
    };
  }

  return payload;
};

const validatePayload = (tab, payload) => {
  if (tab === 'users') {
    if (!payload.name || !payload.email || !payload.role) return 'User requires name, email, and role.';
  }
  if (tab === 'prescriptions') {
    if (!getId(payload.patient)) return 'Prescription requires patient.id.';
    if (!getId(payload.doctor)) return 'Prescription requires doctor.id.';
    if (!Array.isArray(payload.medications) || payload.medications.length === 0 || !(payload.medications[0]?.name || '').trim()) {
      return 'Prescription requires at least one medication with name.';
    }
  }
  if (tab === 'reminders') {
    if (!getId(payload.patient)) return 'Reminder requires patient.id.';
    if (!(payload.medicineName || '').trim()) return 'Reminder requires medicineName.';
  }
  if (tab === 'inventory') {
    if (!getId(payload.pharmacist)) return 'Inventory item requires pharmacist.id.';
    if (!(payload.medicineName || '').trim()) return 'Inventory item requires medicineName.';
  }
  if (tab === 'refills') {
    if (!getId(payload.patient) || !getId(payload.pharmacist) || !getId(payload.prescription)) {
      return 'Refill request requires patient.id, pharmacist.id, and prescription.id.';
    }
  }
  if (tab === 'doseLogs') {
    if (!getId(payload.patient) || !getId(payload.reminder)) return 'Dose log requires patient.id and reminder.id.';
    if (!payload.status) return 'Dose log requires status.';
  }
  if (tab === 'notifications') {
    if (!(payload.recipientId || '').trim()) return 'Notification requires recipientId.';
    if (!(payload.title || '').trim()) return 'Notification requires title.';
    if (!(payload.message || '').trim()) return 'Notification requires message.';
  }
  return '';
};

const tabConfigs = {
  users: {
    label: 'Users',
    singular: 'User',
    hint: 'Create/update users. Required: name, email, role. Optional: password and profile fields including address.',
    template: {
      name: '',
      email: '',
      password: '',
      role: 'PATIENT',
      enabled: true,
      phoneNumber: '',
      dateOfBirth: '',
      address: '',
      licenseNumber: '',
      specialization: '',
      medicalHistory: '',
      allergies: '',
      emergencyContact: '',
    },
    fetch: adminService.getUsers,
    create: adminService.createUser,
    update: adminService.updateUser,
    remove: adminService.deleteUser,
    toEditable: (record) => ({
      name: record.name || '',
      email: record.email || '',
      password: '',
      role: record.role || 'PATIENT',
      enabled: Boolean(record.enabled),
      phoneNumber: record.phoneNumber || '',
      dateOfBirth: record.dateOfBirth || '',
      address: record.address || '',
      licenseNumber: record.licenseNumber || '',
      specialization: record.specialization || '',
      medicalHistory: record.medicalHistory || '',
      allergies: record.allergies || '',
      emergencyContact: record.emergencyContact || '',
    }),
    summary: (record) => record.name || record.email || 'User',
    details: (record) => `${record.email || '-'} | ${record.role || 'UNASSIGNED'} | Enabled: ${record.enabled ? 'Yes' : 'No'} | Phone: ${record.phoneNumber || '-'} | Address: ${record.address || '-'}`,
  },
  prescriptions: {
    label: 'Prescriptions',
    singular: 'Prescription',
    hint: 'Use patient.id and doctor.id. medications must be an array of medication objects.',
    template: {
      patient: { id: '' },
      doctor: { id: '' },
      medications: [{ name: '', dosage: '', frequency: '', duration: '', timeOfDay: '', instructions: '' }],
      diagnosis: '',
      notes: '',
      status: 'ACTIVE',
      refillLimit: 0,
      refillsRemaining: 0,
      validUntil: null,
    },
    fetch: adminService.getPrescriptions,
    create: adminService.createPrescription,
    update: adminService.updatePrescription,
    remove: adminService.deletePrescription,
    toEditable: (record) => ({
      patient: { id: record.patient?.id || '' },
      doctor: { id: record.doctor?.id || '' },
      medications: record.medications || [],
      diagnosis: record.diagnosis || '',
      notes: record.notes || '',
      status: record.status || 'ACTIVE',
      refillLimit: record.refillLimit ?? 0,
      refillsRemaining: record.refillsRemaining ?? 0,
      validUntil: record.validUntil || null,
    }),
    summary: (record) => `${record.patient?.name || 'Patient'} - ${record.doctor?.name || 'Doctor'}`,
    details: (record) => `${(record.medications || []).map((medication) => medication.name).filter(Boolean).join(', ') || 'No meds'} | ${record.status || '-'} | Notes: ${record.notes || '-'}`,
  },
  reminders: {
    label: 'Reminders',
    singular: 'Reminder',
    hint: 'Use patient.id and times array, e.g. ["08:00", "20:00"].',
    template: {
      patient: { id: '' },
      medicineName: '',
      dosage: '',
      frequency: '',
      times: ['08:00'],
      startDate: null,
      endDate: null,
      instructions: '',
      active: true,
    },
    fetch: adminService.getReminders,
    create: adminService.createReminder,
    update: adminService.updateReminder,
    remove: adminService.deleteReminder,
    toEditable: (record) => ({
      patient: { id: record.patient?.id || '' },
      medicineName: record.medicineName || '',
      dosage: record.dosage || '',
      frequency: record.frequency || '',
      times: record.times || [],
      startDate: record.startDate || null,
      endDate: record.endDate || null,
      instructions: record.instructions || '',
      active: Boolean(record.active),
    }),
    summary: (record) => `${record.patient?.name || 'Patient'} - ${record.medicineName || 'Medicine'}`,
    details: (record) => `${(record.times || []).join(', ') || '-'} | Active: ${record.active ? 'Yes' : 'No'} | Instructions: ${record.instructions || '-'}`,
  },
  inventory: {
    label: 'Inventory',
    singular: 'Inventory Item',
    hint: 'Use pharmacist.id and ISO date-time for expiryDate when needed.',
    template: {
      pharmacist: { id: '' },
      medicineName: '',
      batchNumber: '',
      quantity: 0,
      price: 0,
      expiryDate: null,
      status: 'IN_STOCK',
    },
    fetch: adminService.getInventory,
    create: adminService.createInventoryItem,
    update: adminService.updateInventoryItem,
    remove: adminService.deleteInventoryItem,
    toEditable: (record) => ({
      pharmacist: { id: record.pharmacist?.id || '' },
      medicineName: record.medicineName || '',
      batchNumber: record.batchNumber || '',
      quantity: record.quantity ?? 0,
      price: record.price ?? 0,
      expiryDate: record.expiryDate || null,
      status: record.status || 'IN_STOCK',
    }),
    summary: (record) => record.medicineName || 'Inventory Item',
    details: (record) => `${record.pharmacist?.name || '-'} | Qty: ${record.quantity ?? 0} | ${record.status || '-'} | Price: ${record.price ?? 0}`,
  },
  refills: {
    label: 'Refill Requests',
    singular: 'Refill Request',
    hint: 'Use patient.id, pharmacist.id, and prescription.id.',
    template: {
      patient: { id: '' },
      pharmacist: { id: '' },
      prescription: { id: '' },
      status: 'REQUESTED',
      note: '',
    },
    fetch: adminService.getRefillRequests,
    create: adminService.createRefillRequest,
    update: adminService.updateRefillRequest,
    remove: adminService.deleteRefillRequest,
    toEditable: (record) => ({
      patient: { id: record.patient?.id || '' },
      pharmacist: { id: record.pharmacist?.id || '' },
      prescription: { id: record.prescription?.id || '' },
      status: record.status || 'REQUESTED',
      note: record.note || '',
    }),
    summary: (record) => `${record.patient?.name || 'Patient'} -> ${record.pharmacist?.name || 'Pharmacist'}`,
    details: (record) => `${record.status || '-'} | Prescription: ${record.prescription?.id || '-'} | Note: ${record.note || '-'}`,
  },
  doseLogs: {
    label: 'Dose Logs',
    singular: 'Dose Log',
    hint: 'Use patient.id, reminder.id, scheduledAt, takenAt, and status (TAKEN or MISSED).',
    template: {
      patient: { id: '' },
      reminder: { id: '' },
      scheduledAt: null,
      takenAt: null,
      status: 'TAKEN',
    },
    fetch: adminService.getDoseLogs,
    create: adminService.createDoseLog,
    update: adminService.updateDoseLog,
    remove: adminService.deleteDoseLog,
    toEditable: (record) => ({
      patient: { id: record.patient?.id || '' },
      reminder: { id: record.reminder?.id || '' },
      scheduledAt: record.scheduledAt || null,
      takenAt: record.takenAt || null,
      status: record.status || 'TAKEN',
    }),
    summary: (record) => `${record.patient?.name || 'Patient'} | ${record.status || 'TAKEN'}`,
    details: (record) => `Reminder: ${record.reminder?.id || '-'} | Scheduled: ${formatDateTime(record.scheduledAt)} | Taken: ${formatDateTime(record.takenAt)}`,
  },
  notifications: {
    label: 'Notifications',
    singular: 'Notification',
    hint: 'Use recipientId and optional senderId.',
    template: {
      recipientId: '',
      senderId: '',
      type: 'GENERAL',
      title: '',
      message: '',
      referenceType: '',
      referenceId: '',
      read: false,
    },
    fetch: adminService.getNotifications,
    create: adminService.createNotification,
    update: adminService.updateNotification,
    remove: adminService.deleteNotification,
    toEditable: (record) => ({
      recipientId: record.recipient?.id || '',
      senderId: record.sender?.id || '',
      type: record.type || 'GENERAL',
      title: record.title || '',
      message: record.message || '',
      referenceType: record.referenceType || '',
      referenceId: record.referenceId || '',
      read: Boolean(record.read),
    }),
    summary: (record) => record.title || 'Notification',
    details: (record) => `${record.recipient?.name || '-'} | ${record.type || '-'} | Read: ${record.read ? 'Yes' : 'No'} | Message: ${record.message || '-'}`,
  },
};

const ControlCenter = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [records, setRecords] = useState(initialRecords);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState(JSON.stringify(tabConfigs.users.template, null, 2));

  const activeConfig = useMemo(() => tabConfigs[activeTab], [activeTab]);
  const rows = records[activeTab] || [];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setEditingId('');
    setDraft(JSON.stringify(activeConfig.template, null, 2));
    setError('');
    setMessage('');
  }, [activeTab, activeConfig]);

  const loadData = async () => {
    try {
      const [users, prescriptions, reminders, inventory, refills, doseLogs, notifications] = await Promise.all([
        tabConfigs.users.fetch(),
        tabConfigs.prescriptions.fetch(),
        tabConfigs.reminders.fetch(),
        tabConfigs.inventory.fetch(),
        tabConfigs.refills.fetch(),
        tabConfigs.doseLogs.fetch(),
        tabConfigs.notifications.fetch(),
      ]);

      setRecords({
        users: users.data || [],
        prescriptions: prescriptions.data || [],
        reminders: reminders.data || [],
        inventory: inventory.data || [],
        refills: refills.data || [],
        doseLogs: doseLogs.data || [],
        notifications: notifications.data || [],
      });
      setError('');
    } catch (err) {
      setError('Failed to load admin records.');
    } finally {
      setLoading(false);
    }
  };

  const startCreate = (clearFeedback = true) => {
    setEditingId('');
    setDraft(JSON.stringify(activeConfig.template, null, 2));
    if (clearFeedback) {
      setError('');
      setMessage('');
    }
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setDraft(JSON.stringify(activeConfig.toEditable(record), null, 2));
    setError('');
    setMessage('');
  };

  const saveDraft = async () => {
    setError('');
    setMessage('');

    let payload;
    try {
      payload = JSON.parse(draft);
    } catch (err) {
      setError('Invalid JSON. Please fix formatting before saving.');
      return;
    }

    payload = normalizePayload(activeTab, payload);
    const validationError = validatePayload(activeTab, payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await activeConfig.update(editingId, payload);
      } else {
        await activeConfig.create(payload);
      }
      startCreate(false);
      await loadData();
      setMessage(`${activeConfig.singular} ${editingId ? 'updated' : 'created'} successfully.`);
    } catch (err) {
      const apiMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message;
      setError(apiMessage || `Failed to save ${activeConfig.label.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    setError('');
    setMessage('');

    try {
      setSaving(true);
      await activeConfig.remove(id);
      if (editingId === id) startCreate(false);
      await loadData();
      setMessage(`${activeConfig.singular} deleted successfully.`);
    } catch (err) {
      const apiMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message;
      setError(apiMessage || `Failed to delete ${activeConfig.label.toLowerCase()}.`);
    } finally {
      setSaving(false);
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

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Control Center</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Full CRUD management for users, prescriptions, reminders, inventory, refills, dose logs, and notifications
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-outline" onClick={loadData} disabled={saving}>
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="btn btn-primary" onClick={startCreate} disabled={saving}>
              <Plus size={16} />
              New {activeConfig.singular}
            </button>
          </div>
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

        <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(tabConfigs).map(([key, config]) => (
              <button
                key={key}
                className={`btn ${activeTab === key ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(key)}
                style={{ whiteSpace: 'nowrap' }}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
              {editingId ? `Edit ${activeConfig.singular}` : `Create ${activeConfig.singular}`}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              {activeConfig.hint}
            </p>
            <textarea
              className="input"
              rows={20}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              <button className="btn btn-primary" onClick={saveDraft} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              {editingId && (
                <button className="btn btn-outline" onClick={startCreate}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
              {activeConfig.label} ({rows.length})
            </h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{activeConfig.summary(row)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{activeConfig.details(row)}</div>
                      </td>
                      <td>{formatDateTime(row.updatedAt || row.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem' }} onClick={() => startEdit(row)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem', color: 'var(--error)' }} onClick={() => deleteRecord(row.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ color: 'var(--text-secondary)' }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ControlCenter;
