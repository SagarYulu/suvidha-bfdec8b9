
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Admin pages
import Dashboard from '@/pages/admin/Dashboard';
import Employees from '@/pages/admin/Employees';
import Issues from '@/pages/admin/Issues';
import Settings from '@/pages/admin/Settings';
import AdminLogin from '@/pages/admin/AdminLogin';
import IssueDetails from '@/pages/admin/IssueDetails';
import UserManagement from '@/pages/admin/UserManagement';
import UserPermissions from '@/pages/admin/UserPermissions';
import SentimentAnalysis from '@/pages/admin/SentimentAnalysis';
import ResolutionFeedback from '@/pages/admin/ResolutionFeedback';
import MasterData from '@/pages/admin/MasterData';

// Mobile pages
import MobileHome from '@/pages/mobile/Home';
import MobileIssues from '@/pages/mobile/Issues';
import MobileIssueDetails from '@/pages/mobile/IssueDetails';
import MobileNewIssue from '@/pages/mobile/NewIssue';
import MobileLogin from '@/pages/mobile/Login';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute requiredPermission="view:dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute requiredPermission="manage:employees"><Employees /></ProtectedRoute>} />
          <Route path="/admin/issues" element={<ProtectedRoute requiredPermission="manage:issues"><Issues /></ProtectedRoute>} />
          <Route path="/admin/issues/:id" element={<ProtectedRoute requiredPermission="manage:issues"><IssueDetails /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredPermission="manage:users"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/users/permissions" element={<ProtectedRoute requiredPermission="manage:permissions"><UserPermissions /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredPermission="manage:settings"><Settings /></ProtectedRoute>} />
          <Route path="/admin/sentiment" element={<ProtectedRoute requiredPermission="manage:analytics"><SentimentAnalysis /></ProtectedRoute>} />
          <Route path="/admin/resolution-feedback" element={<ProtectedRoute requiredPermission="manage:analytics"><ResolutionFeedback /></ProtectedRoute>} />
          <Route path="/admin/master-data" element={<ProtectedRoute requiredPermission="manage:master-data"><MasterData /></ProtectedRoute>} />
          
          {/* Remove feedback analytics route if it exists */}
          
          {/* Mobile routes */}
          <Route path="/mobile/login" element={<MobileLogin />} />
          <Route path="/mobile" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
          <Route path="/mobile/issues" element={<ProtectedRoute><MobileIssues /></ProtectedRoute>} />
          <Route path="/mobile/issues/new" element={<ProtectedRoute><MobileNewIssue /></ProtectedRoute>} />
          <Route path="/mobile/issues/:id" element={<ProtectedRoute><MobileIssueDetails /></ProtectedRoute>} />
          
          {/* Default routes */}
          <Route path="/" element={<Navigate to="/admin/login" />} />
          <Route path="*" element={<Navigate to="/admin/login" />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
