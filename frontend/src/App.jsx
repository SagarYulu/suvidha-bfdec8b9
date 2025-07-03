import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import IssuesList from './pages/IssuesList';
import EmployeesList from './pages/EmployeesList';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Main App Routes
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/admin/login" element={<Login isEmployee={false} />} />
      <Route path="/employee/login" element={<Login isEmployee={true} />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/employees" 
        element={
          <ProtectedRoute requiredRole="admin">
            <EmployeesList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/issues" 
        element={
          <ProtectedRoute requiredRole="admin">
            <IssuesList isAdmin={true} />
          </ProtectedRoute>
        } 
      />
      
      {/* Employee Routes */}
      <Route 
        path="/employee/dashboard" 
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/issues" 
        element={
          <ProtectedRoute requiredRole="employee">
            <IssuesList isAdmin={false} />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all redirect */}
      <Route 
        path="/" 
        element={
          user?.role === 'admin' 
            ? <Navigate to="/admin/dashboard" replace />
            : user?.role === 'employee'
            ? <Navigate to="/employee/issues" replace />
            : <Navigate to="/admin/login" replace />
        } 
      />
      
      {/* 404 and Unauthorized */}
      <Route 
        path="/unauthorized" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
              <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        } 
      />
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
              <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;