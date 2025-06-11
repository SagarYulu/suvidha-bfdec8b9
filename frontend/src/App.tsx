
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import Login from '@/pages/admin/Login';
import Dashboard from '@/pages/admin/Dashboard';
import Issues from '@/pages/admin/Issues';
import Employees from '@/pages/admin/Employees';
import Analytics from '@/pages/admin/Analytics';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Redirect root to admin */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Admin Login */}
              <Route path="/admin/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="issues" element={<Issues />} />
                <Route path="employees" element={<Employees />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="bulk-upload" element={<div>Bulk Upload Page (Coming Soon)</div>} />
                <Route path="feedback" element={<div>Feedback Page (Coming Soon)</div>} />
                <Route path="reports" element={<div>Reports Page (Coming Soon)</div>} />
                <Route path="users" element={<div>User Management Page (Coming Soon)</div>} />
                <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
            
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
