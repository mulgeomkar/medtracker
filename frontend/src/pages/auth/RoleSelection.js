import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, User, Stethoscope, Package, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const pendingSignupName = localStorage.getItem('pendingSignupName');
  const displayName = user?.name || pendingSignupName || user?.email?.split('@')[0] || 'there';

  const roles = [
    {
      id: 'PATIENT',
      icon: User,
      title: 'Patient',
      description: 'Track your medications and prescriptions',
      path: '/setup/patient'
    },
    {
      id: 'DOCTOR',
      icon: Stethoscope,
      title: 'Doctor',
      description: 'Manage patients and issue prescriptions',
      path: '/setup/doctor'
    },
    {
      id: 'PHARMACIST',
      icon: Package,
      title: 'Pharmacist',
      description: 'Manage inventory and fulfill prescriptions',
      path: '/setup/pharmacist'
    },
    {
      id: 'ADMIN',
      icon: ShieldCheck,
      title: 'Admin',
      description: 'Control all users, records, and system operations',
      path: '/setup/admin'
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      const role = roles.find(r => r.id === selectedRole);
      localStorage.setItem('selectedRole', selectedRole);
      navigate(role.path);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--primary-bg)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '900px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'rgba(0, 217, 165, 0.1)',
            marginBottom: '1rem'
          }}>
            <Activity size={32} color="#00d9a5" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Welcome, {displayName}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
            What best describes you?
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="card"
                style={{
                  cursor: 'pointer',
                  border: isSelected 
                    ? '2px solid var(--accent-teal)' 
                    : '1px solid var(--border-color)',
                  background: isSelected 
                    ? 'rgba(0, 217, 165, 0.05)' 
                    : 'var(--card-bg)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: isSelected 
                    ? 'var(--accent-teal)' 
                    : 'rgba(0, 217, 165, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  transition: 'all 0.3s ease'
                }}>
                  <Icon 
                    size={28} 
                    color={isSelected ? 'var(--primary-bg)' : '#00d9a5'} 
                  />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {role.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  {role.description}
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '1rem',
            fontSize: '1.125rem'
          }}
          disabled={!selectedRole}
        >
          Continue
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
