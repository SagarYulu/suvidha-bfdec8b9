
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { RBACProvider } from './contexts/RBACContext';

// Import pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Mobile pages
import MobileLogin from './pages/mobile/Login';
import MobileIssues from './pages/mobile/Issues';
import MobileIssueDetails from './pages/mobile/IssueDetails';
import MobileNewIssue from './pages/mobile/NewIssue';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminIssues from './pages/admin/Issues';
import AdminIssueDetails from './pages/admin/IssueDetails';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSecurity from './pages/admin/AccessControl';
import AddDashboardUser from './pages/admin/dashboard-users/AddDashboardUser';
import AssignedTickets from './pages/admin/AssignedTickets';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RBACProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Mobile routes */}
            <Route path="/mobile/login" element={<MobileLogin />} />
            <Route path="/mobile/issues" element={<MobileIssues />} />
            <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
            <Route path="/mobile/issues/new" element={<MobileNewIssue />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/issues" element={<AdminIssues />} />
            <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/dashboard-users/add" element={<AddDashboardUser />} />
            <Route path="/admin/dashboard-users" element={<AdminUsers />} />
            <Route path="/admin/assigned-tickets" element={<AssignedTickets />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </RBACProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
