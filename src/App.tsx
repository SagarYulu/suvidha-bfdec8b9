import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import LoginPage from './pages/LoginPage';
import MobileLoginPage from './pages/mobile/MobileLoginPage';
import MobileIssues from './pages/mobile/Issues';
import MobileIssueDetails from './pages/mobile/IssueDetails';
import MobileNewIssue from './pages/mobile/NewIssue';
import MobileSentiment from './pages/mobile/Sentiment';
import { RoleAccessProvider } from './contexts/RoleAccessContext';
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/hooks/use-toast"
import MyTickets from "./pages/mobile/MyTickets";

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
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route path="/admin">
          {/* Redirect to admin login if not authenticated */}
          <Route index element={
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
          <Route path="login" element={<MobileLoginPage />} />
          <Route path="issues" element={<MobileIssues />} />
          <Route path="my-tickets" element={<MyTickets />} /> {/* Add this line */}
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
      <RoleAccessProvider>
        <Router>
          <AppContent />
        </Router>
      </RoleAccessProvider>
    </AuthProvider>
  );
}

export default App;
