
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import Login from './pages/Login';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AccessControl from './pages/admin/AccessControl';
import MobileLogin from './pages/mobile/Login';
import MobileLayout from './components/MobileLayout';
import RoleBasedGuard from './components/guards/RoleBasedGuard';
import { SecurityGuard } from './components/guards/PermissionGuards';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </RBACProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { authState } = useAuth();

  // Function to determine if the user is an admin
  const isAdmin = authState.role === 'admin' || authState.role === 'security-admin' || authState.role === 'Super Admin';

  // Custom route for handling redirection based on authentication status
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    return authState.isAuthenticated ? (
      isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />
    ) : (
      children
    );
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/admin/login" element={<AuthRoute><AdminLogin /></AuthRoute>} />
      <Route path="/mobile/login" element={<AuthRoute><MobileLogin /></AuthRoute>} />

      {/* Common Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <RoleBasedGuard permission="view:dashboard" redirectTo="/admin/login">
          <AdminDashboard />
        </RoleBasedGuard>
      } />
      <Route path="/admin/access-control" element={
        <SecurityGuard redirectTo="/admin/dashboard">
          <AccessControl />
        </SecurityGuard>
      } />
    </Routes>
  );
}

export default App;
