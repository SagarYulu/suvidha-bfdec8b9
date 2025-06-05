
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import { Toaster } from './components/ui/sonner';

// Layout Components
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Mobile Pages
import MobileLogin from './pages/mobile/Login';
import MobileIssues from './pages/mobile/Issues';
import MobileIssueDetails from './pages/mobile/IssueDetails';
import MobileNewIssue from './pages/mobile/NewIssue';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminIssues from './pages/admin/Issues';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import FeedbackAnalytics from './pages/admin/FeedbackAnalytics';
import SentimentAnalysis from './pages/admin/SentimentAnalysis';
import AssignedIssues from './pages/admin/AssignedIssues';
import AdminSettings from './pages/admin/Settings';
import Exports from './pages/admin/Exports';

function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Root Route */}
              <Route path="/" element={<Index />} />
              
              {/* Mobile Routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />
              <Route path="/mobile/issues" element={<MobileIssues />} />
              <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
              <Route path="/mobile/new-issue" element={<MobileNewIssue />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="issues" element={<AdminIssues />} />
                <Route path="assigned-issues" element={<AssignedIssues />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="feedback-analytics" element={<FeedbackAnalytics />} />
                <Route path="sentiment-analysis" element={<SentimentAnalysis />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="exports" element={<Exports />} />
              </Route>
              
              {/* Redirects */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/mobile" element={<Navigate to="/mobile/issues" replace />} />
              
              {/* 404 */}
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
