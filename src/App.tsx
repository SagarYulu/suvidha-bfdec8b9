
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RBACProvider } from '@/contexts/RBACContext';
import AdminLayout from '@/components/layout/AdminLayout';
import Login from '@/pages/admin/Login';
import NotFound from '@/pages/NotFound';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import Issues from '@/pages/admin/Issues';
import Users from '@/pages/admin/Users';
import Analytics from '@/pages/admin/Analytics';
import Settings from '@/pages/admin/Settings';
import AddDashboardUser from '@/pages/admin/dashboard-users/AddDashboardUser';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { authState } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={authState.isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/issues" element={
        <ProtectedRoute>
          <AdminLayout>
            <Issues />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/issues" element={
        <ProtectedRoute>
          <AdminLayout>
            <Issues />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <AdminLayout>
            <Users />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <AdminLayout>
            <Users />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard-users/add" element={
        <ProtectedRoute>
          <AdminLayout>
            <AddDashboardUser />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AdminLayout>
            <Analytics />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/analytics" element={
        <ProtectedRoute>
          <AdminLayout>
            <Analytics />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RBACProvider>
          <Router>
            <AppRoutes />
            <Toaster position="top-right" />
          </Router>
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
