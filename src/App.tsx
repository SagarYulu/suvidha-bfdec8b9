import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccessControl from './pages/admin/AccessControl';
import MobileLoginPage from './pages/mobile/MobileLoginPage';
import MobileIssues from './pages/mobile/Issues';
import MobileLayout from './components/MobileLayout';
import RoleBasedGuard from './components/guards/RoleBasedGuard';
import { SecurityGuard } from './components/guards/PermissionGuards';
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

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
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/admin/login" element={<AuthRoute><AdminLoginPage /></AuthRoute>} />
      <Route path="/mobile/login" element={<AuthRoute><MobileLoginPage /></AuthRoute>} />

      {/* Common Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/mobile/issues" element={
        <MobileLayout title="My Issues">
          <MobileIssues />
        </MobileLayout>
      } />

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
