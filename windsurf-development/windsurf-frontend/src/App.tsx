
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// Pages
import IndexPage from '@/pages/Index';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminIssues from '@/pages/admin/Issues';
import AdminUsers from '@/pages/admin/Users';
import AdminAnalytics from '@/pages/admin/Analytics';
import MobileLogin from '@/pages/mobile/Login';
import MobileIssues from '@/pages/mobile/Issues';
import MobileCreateIssue from '@/pages/mobile/CreateIssue';

// Layout components
import AdminLayout from '@/components/layouts/AdminLayout';
import MobileLayout from '@/components/layouts/MobileLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
              {/* Landing page */}
              <Route path="/" element={<IndexPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="issues" element={<AdminIssues />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>
              
              {/* Mobile routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />
              <Route path="/mobile" element={
                <ProtectedRoute requiredRole="employee">
                  <MobileLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/mobile/issues" replace />} />
                <Route path="issues" element={<MobileIssues />} />
                <Route path="create-issue" element={<MobileCreateIssue />} />
              </Route>
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster />
            <SonnerToaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
