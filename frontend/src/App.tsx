
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

// Import pages
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import IssueManagement from '@/pages/admin/IssueManagement';
import UserManagement from '@/pages/admin/UserManagement';
import Analytics from '@/pages/admin/Analytics';
import FeedbackAnalytics from '@/pages/admin/FeedbackAnalytics';

// Mobile pages
import MobileLogin from '@/pages/mobile/Login';
import MobileIssues from '@/pages/mobile/Issues';
import MobileNewIssue from '@/pages/mobile/NewIssue';
import MobileIssueDetails from '@/pages/mobile/IssueDetails';

// Create a client
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
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/admin/login" replace />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/issues" element={<IssueManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/feedback" element={<FeedbackAnalytics />} />
              
              {/* Mobile routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />
              <Route path="/mobile/issues" element={<MobileIssues />} />
              <Route path="/mobile/issues/new" element={<MobileNewIssue />} />
              <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
