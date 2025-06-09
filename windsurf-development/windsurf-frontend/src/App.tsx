
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import { Toaster } from './components/ui/toaster';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminIssues from './pages/admin/Issues';
import AdminIssueDetails from './pages/admin/IssueDetails';
import AdminUsers from './pages/admin/Users';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminAnalytics from './pages/admin/Analytics';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import TestDashboard from './pages/admin/TestDashboard';

// Mobile Pages
import MobileLogin from './pages/mobile/Login';
import MobileIssues from './pages/mobile/Issues';
import MobileIssueDetails from './pages/mobile/IssueDetails';
import MobileNewIssue from './pages/mobile/NewIssue';
import MobileProfile from './pages/mobile/Profile';
import MobileFeedback from './pages/mobile/Feedback';
import MobileSentiment from './pages/mobile/Sentiment';

// Common Pages
import NotFound from './pages/NotFound';
import Index from './pages/Index';

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
        <RBACProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Root Route */}
                <Route path="/" element={<Index />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/issues" element={<AdminIssues />} />
                <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/user-management" element={<AdminUserManagement />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/test" element={<TestDashboard />} />
                
                {/* Mobile Routes */}
                <Route path="/mobile/login" element={<MobileLogin />} />
                <Route path="/mobile/issues" element={<MobileIssues />} />
                <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
                <Route path="/mobile/issues/new" element={<MobileNewIssue />} />
                <Route path="/mobile/profile" element={<MobileProfile />} />
                <Route path="/mobile/feedback" element={<MobileFeedback />} />
                <Route path="/mobile/sentiment" element={<MobileSentiment />} />
                
                {/* Redirects */}
                <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
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
