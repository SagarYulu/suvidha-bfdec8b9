
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin Pages
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import IssueManagement from '@/pages/admin/Issues';
import IssueDetails from '@/pages/admin/IssueDetails';
import UserManagement from '@/pages/admin/Users';
import Analytics from '@/pages/admin/Analytics';
import FeedbackAnalytics from '@/pages/admin/FeedbackAnalytics';
import Settings from '@/pages/admin/Settings';

// Auth check component
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/issues" element={
        <ProtectedRoute>
          <IssueManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/issues/:id" element={
        <ProtectedRoute>
          <IssueDetails />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/admin/feedback" element={
        <ProtectedRoute>
          <FeedbackAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
