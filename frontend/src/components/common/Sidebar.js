import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Bell,
  BarChart3,
  User,
  Package,
  Users,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const role = user?.role?.toLowerCase();
    
    switch (role) {
      case 'patient':
        return [
          { path: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/patient/prescriptions', icon: FileText, label: 'Prescriptions' },
          { path: '/patient/reminders', icon: Bell, label: 'Reminders' },
          { path: '/patient/analytics', icon: BarChart3, label: 'Analytics' },
          { path: '/patient/profile', icon: User, label: 'Profile' },
        ];
      case 'doctor':
        return [
          { path: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/doctor/patients', icon: Users, label: 'Patients' },
          { path: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
          { path: '/doctor/analytics', icon: BarChart3, label: 'Analytics' },
          { path: '/doctor/profile', icon: User, label: 'Profile' },
        ];
      case 'pharmacist':
        return [
          { path: '/pharmacist/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/pharmacist/inventory', icon: Package, label: 'Inventory' },
          { path: '/pharmacist/analytics', icon: BarChart3, label: 'Analytics' },
          { path: '/pharmacist/profile', icon: User, label: 'Profile' },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/admin/control-center', icon: Settings, label: 'Control Center' },
          { path: '/admin/profile', icon: User, label: 'Profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigationItems();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="sidebar-close-btn"
        aria-label="Close sidebar"
        onClick={onClose}
      >
        x
      </button>

      <div className="sidebar-logo">
        <Activity size={32} color="#00d9a5" />
        <h2>MedTracker</h2>
      </div>

      {user && (
        <div className="mb-8 p-4" style={{ 
          background: 'var(--card-bg)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--accent-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-bg)',
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '0.75rem'
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            {displayName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {user.email}
          </div>
        </div>
      )}

      <ul className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path} className="sidebar-nav-item">
              <Link
                to={item.path}
                className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button
          onClick={handleLogout}
          className="sidebar-nav-link"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--error)'
          }}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
