
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import MyTickets from "./pages/mobile/MyTickets";
import MobileIssues from './pages/mobile/Issues';
import MobileIssueDetails from './pages/mobile/IssueDetails';
import MobileNewIssue from './pages/mobile/NewIssue';
import MobileSentiment from './pages/mobile/Sentiment';
import AdminDashboard from './pages/admin/Dashboard';
import AccessControl from './pages/admin/AccessControl';
import { RBACProvider } from './contexts/RBACContext';

function AppContent() {
  const { authState } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log the current route whenever it changes
    console.log(`Route changed to: ${location.pathname}`);
  }, [location]);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<div>Login Page</div>} />

        {/* Admin routes */}
        <Route path="/admin">
          <Route index element={
            !authState.isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <AdminDashboard />
            )
          } />
          <Route path="access-control" element={
            !authState.isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <AccessControl />
            )
          } />
          <Route path="dashboard" element={
            !authState.isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <AdminDashboard />
            )
          } />
          {/* Add more admin routes here if needed */}
        </Route>

        {/* Mobile routes */}
        <Route path="/mobile">
          <Route index element={<Navigate to="/mobile/issues" replace />} />
          <Route path="login" element={<div>Mobile Login</div>} />
          <Route path="issues" element={<MobileIssues />} />
          <Route path="my-tickets" element={<MyTickets />} /> 
          <Route path="issues/:id" element={<MobileIssueDetails />} />
          <Route path="issues/new" element={<MobileNewIssue />} />
          <Route path="sentiment" element={<MobileSentiment />} />
        </Route>

        {/* Fallback route - redirect to login if not authenticated */}
        <Route
          path="/"
          element={
            !authState.isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <Router>
          <AppContent />
        </Router>
      </RBACProvider>
    </AuthProvider>
  );
}

export default App;
