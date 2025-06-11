
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { RBACProvider } from '@/contexts/RBACContext';
import { Toaster } from '@/components/ui/toaster';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import Issues from '@/pages/admin/Issues';
import Analytics from '@/pages/admin/Analytics';
import Feedback from '@/pages/admin/Feedback';
import Users from '@/pages/admin/Users';
import Settings from '@/pages/admin/Settings';
import Sentiment from '@/pages/admin/Sentiment';
import Login from '@/pages/admin/Login';

// Mobile Pages
import MobileLogin from '@/pages/mobile/Login';
import MobileIssues from '@/pages/mobile/Issues';
import NewIssue from '@/pages/mobile/NewIssue';
import IssueDetails from '@/pages/mobile/IssueDetails';
import MobileFeedback from '@/pages/mobile/Feedback';
import MobileProfile from '@/pages/mobile/Profile';

// Layout Components
import AdminLayout from '@/components/AdminLayout';
import MobileLayout from '@/components/MobileLayout';

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
            <div className="App">
              <Routes>
                {/* Root route - redirect to admin dashboard */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/dashboard" element={
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                } />
                <Route path="/admin/issues" element={
                  <AdminLayout>
                    <Issues />
                  </AdminLayout>
                } />
                <Route path="/admin/analytics" element={
                  <AdminLayout>
                    <Analytics />
                  </AdminLayout>
                } />
                <Route path="/admin/feedback" element={
                  <AdminLayout>
                    <Feedback />
                  </AdminLayout>
                } />
                <Route path="/admin/sentiment" element={
                  <AdminLayout>
                    <Sentiment />
                  </AdminLayout>
                } />
                <Route path="/admin/users" element={
                  <AdminLayout>
                    <Users />
                  </AdminLayout>
                } />
                <Route path="/admin/settings" element={
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                } />
                
                {/* Mobile Routes */}
                <Route path="/mobile/login" element={<MobileLogin />} />
                <Route path="/mobile/issues" element={
                  <MobileLayout>
                    <MobileIssues />
                  </MobileLayout>
                } />
                <Route path="/mobile/new-issue" element={
                  <MobileLayout>
                    <NewIssue />
                  </MobileLayout>
                } />
                <Route path="/mobile/issue/:id" element={
                  <MobileLayout>
                    <IssueDetails />
                  </MobileLayout>
                } />
                <Route path="/mobile/feedback" element={
                  <MobileLayout>
                    <MobileFeedback />
                  </MobileLayout>
                } />
                <Route path="/mobile/profile" element={
                  <MobileLayout>
                    <MobileProfile />
                  </MobileLayout>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
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
