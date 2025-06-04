
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RBACProvider } from '@/contexts/RBACContext';
import AdminLayout from '@/components/layout/AdminLayout';
import Login from '@/pages/Login';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import Issues from '@/pages/admin/Issues';
import Users from '@/pages/admin/Users';
import Analytics from '@/pages/admin/Analytics';
import Exports from '@/pages/admin/Exports';
import Settings from '@/pages/admin/Settings';

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
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      
      <Route path="/" element={
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
      
      <Route path="/users" element={
        <ProtectedRoute>
          <AdminLayout>
            <Users />
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
      
      <Route path="/exports" element={
        <ProtectedRoute>
          <AdminLayout>
            <Exports />
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
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
