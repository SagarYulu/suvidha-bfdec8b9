
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
                <Route path="bulk-upload" element={<div className="p-6"><h1 className="text-2xl font-bold">Bulk Upload</h1><p>Coming Soon</p></div>} />
                <Route path="feedback" element={<div className="p-6"><h1 className="text-2xl font-bold">Feedback</h1><p>Coming Soon</p></div>} />
                <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Coming Soon</p></div>} />
                <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p>Coming Soon</p></div>} />
                <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Coming Soon</p></div>} />
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
