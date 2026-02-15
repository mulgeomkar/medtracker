import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import RoleSelection from './pages/auth/RoleSelection';
import PatientSetup from './pages/auth/PatientSetup';
import DoctorSetup from './pages/auth/DoctorSetup';
import PharmacistSetup from './pages/auth/PharmacistSetup';
import AdminSetup from './pages/auth/AdminSetup';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientReminders from './pages/patient/Reminders';
import PatientAnalytics from './pages/patient/Analytics';
import PatientProfile from './pages/patient/Profile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import DoctorAnalytics from './pages/doctor/Analytics';
import DoctorProfile from './pages/doctor/Profile';

// Pharmacist Pages
import PharmacistDashboard from './pages/pharmacist/Dashboard';
import PharmacistInventory from './pages/pharmacist/Inventory';
import PharmacistAnalytics from './pages/pharmacist/Analytics';
import PharmacistProfile from './pages/pharmacist/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminControlCenter from './pages/admin/ControlCenter';
import AdminProfile from './pages/admin/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/role-selection" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  const getPostAuthPath = () => {
    if (!user) return '/login';
    if (!user.role) return '/role-selection';
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  return (
    <Routes>
      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={getPostAuthPath()} /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to={getPostAuthPath()} /> : <Signup />} 
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/role-selection" element={user ? <RoleSelection /> : <Navigate to="/login" replace />} />
      <Route path="/setup/patient" element={user ? <PatientSetup /> : <Navigate to="/login" replace />} />
      <Route path="/setup/doctor" element={user ? <DoctorSetup /> : <Navigate to="/login" replace />} />
      <Route path="/setup/pharmacist" element={user ? <PharmacistSetup /> : <Navigate to="/login" replace />} />
      <Route path="/setup/admin" element={user ? <AdminSetup /> : <Navigate to="/login" replace />} />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/reminders"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientReminders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/analytics"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/analytics"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorProfile />
          </ProtectedRoute>
        }
      />

      {/* Pharmacist Routes */}
      <Route
        path="/pharmacist/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PHARMACIST']}>
            <PharmacistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/inventory"
        element={
          <ProtectedRoute allowedRoles={['PHARMACIST']}>
            <PharmacistInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/analytics"
        element={
          <ProtectedRoute allowedRoles={['PHARMACIST']}>
            <PharmacistAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/profile"
        element={
          <ProtectedRoute allowedRoles={['PHARMACIST']}>
            <PharmacistProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/control-center"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminControlCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={getPostAuthPath()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <AuthProvider>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <Router>
            <AppRoutes />
          </Router>
        </GoogleOAuthProvider>
      ) : (
        <Router>
          <AppRoutes />
        </Router>
      )}
    </AuthProvider>
  );
}

export default App;
