
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Login"; // Fallback to Login since Signup may not exist
import Dashboard from "./pages/Index"; // Using Index as Dashboard
import AdminDashboard from "./pages/admin/Dashboard"; // Correct path
import AdminIssues from "./pages/admin/Issues";
import AdminIssueDetails from "./pages/admin/IssueDetails";
import CreateEmployee from "./pages/admin/Users"; // Fallback to Users page
import ManageEmployees from "./pages/admin/Users"; // Fallback to Users page
import AssignedIssues from "./pages/admin/AssignedIssues";
import AssignedTickets from "./pages/admin/AssignedTickets";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { authState } = useAuth();

  useEffect(() => {
    // Log the authentication state on component mount or when it changes
    console.log("Authentication State:", authState);
  }, [authState]);

  return (
    <Routes>
      <Route path="/login" element={!authState.isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!authState.isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={authState.isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />

      {/* Admin Routes - accessible only to admins */}
      <Route path="/admin" element={authState.isAuthenticated && authState.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/issues" element={authState.isAuthenticated && authState.role === 'admin' ? <AdminIssues /> : <Navigate to="/login" />} />
      <Route path="/admin/issues/:issueId" element={authState.isAuthenticated && authState.role === 'admin' ? <AdminIssueDetails /> : <Navigate to="/login" />} />
      <Route path="/admin/create-employee" element={authState.isAuthenticated && authState.role === 'admin' ? <CreateEmployee /> : <Navigate to="/login" />} />
      <Route path="/admin/manage-employees" element={authState.isAuthenticated && authState.role === 'admin' ? <ManageEmployees /> : <Navigate to="/login" />} />
      <Route path="/admin/assigned-issues" element={authState.isAuthenticated && authState.role === 'admin' ? <AssignedIssues /> : <Navigate to="/login" />} />
      
      <Route path="/admin/assigned-tickets" element={<AssignedTickets />} />

      {/* Default Route - redirects to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={authState.isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
