import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import { Toaster } from './components/ui/sonner';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Issues from './pages/admin/Issues';
import IssueDetails from './pages/admin/IssueDetails';
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';

// Mobile Pages
import MobileLogin from './pages/mobile/Login';
import MobileIssues from './pages/mobile/Issues';
import MobileIssueDetails from './pages/mobile/IssueDetails';
import NewIssue from './pages/mobile/NewIssue';
import Feedback from './pages/mobile/Feedback';

// Other Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import DataMigration from './pages/DataMigration';
import DatabaseExport from './pages/DatabaseExport';

function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Index />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="issues" element={<Issues />} />
                <Route path="issues/:id" element={<IssueDetails />} />
                <Route path="users" element={<Users />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>

              {/* Mobile Routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />
              <Route path="/mobile/issues" element={<MobileIssues />} />
              <Route path="/mobile/issues/new" element={<NewIssue />} />
              <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
              <Route path="/mobile/feedback/:issueId" element={<Feedback />} />

              {/* Utility Routes */}
              <Route path="/data-migration" element={<DataMigration />} />
              <Route path="/database-export" element={<DatabaseExport />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster />
          </div>
        </Router>
      </RBACProvider>
    </AuthProvider>
  );
}

export default App;
