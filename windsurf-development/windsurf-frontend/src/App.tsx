
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import { Toaster } from '@/components/ui/toaster';

// Layout Components
import AdminLayout from './components/layout/AdminLayout';
import MobileLayout from './components/layout/MobileLayout';

// Index page
import Index from './pages/Index';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminIssues from './pages/admin/Issues';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

// Mobile Pages
import MobileLogin from './pages/mobile/Login';
import MobileIssues from './pages/mobile/Issues';
import MobileNewIssue from './pages/mobile/NewIssue';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RBACProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Index Route */}
                <Route path="/" element={<Index />} />

                {/* Admin Authentication */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Routes with Layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="issues" element={<AdminIssues />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Mobile Authentication */}
                <Route path="/mobile/login" element={<MobileLogin />} />

                {/* Mobile Routes with Layout */}
                <Route path="/mobile" element={<MobileLayout />}>
                  <Route index element={<Navigate to="/mobile/issues" replace />} />
                  <Route path="issues" element={<MobileIssues />} />
                  <Route path="new-issue" element={<MobileNewIssue />} />
                </Route>

                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
