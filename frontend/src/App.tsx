
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { RBACProvider } from '@/contexts/RBACContext';
import { Toaster } from '@/components/ui/sonner';

// Import pages
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import DataMigration from '@/pages/DataMigration';
import DatabaseExport from '@/pages/DatabaseExport';

// Admin pages
import AdminLogin from '@/pages/admin/Login';
import AdminLayout from '@/components/layouts/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import Issues from '@/pages/admin/Issues';
import IssueDetails from '@/pages/admin/IssueDetails';
import Analytics from '@/pages/admin/Analytics';
import Users from '@/pages/admin/Users';

// Mobile pages
import MobileLogin from '@/pages/mobile/Login';
import MobileIssues from '@/pages/mobile/Issues';
import MobileNewIssue from '@/pages/mobile/NewIssue';
import MobileIssueDetails from '@/pages/mobile/IssueDetails';
import MobileFeedback from '@/pages/mobile/Feedback';

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
        <RBACProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/data-migration" element={<DataMigration />} />
                <Route path="/database-export" element={<DatabaseExport />} />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="issues" element={<Issues />} />
                  <Route path="issues/:id" element={<IssueDetails />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="users" element={<Users />} />
                </Route>
                
                {/* Mobile routes */}
                <Route path="/mobile/login" element={<MobileLogin />} />
                <Route path="/mobile/issues" element={<MobileIssues />} />
                <Route path="/mobile/issues/new" element={<MobileNewIssue />} />
                <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
                <Route path="/mobile/feedback" element={<MobileFeedback />} />
                
                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
