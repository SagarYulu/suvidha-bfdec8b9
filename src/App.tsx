import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import IssuesPage from './pages/admin/IssuesPage';
import IssueDetailsPage from './pages/admin/IssueDetailsPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import AddEmployeePage from './pages/admin/AddEmployeePage';
import EditEmployeePage from './pages/admin/EditEmployeePage';
import SettingsPage from './pages/admin/SettingsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import MasterDataPage from './pages/admin/MasterDataPage';
import NotFoundPage from './pages/NotFoundPage';
import PublicLayout from './components/layouts/PublicLayout';
import BaseLayout from './components/layouts/BaseLayout';
import AdminLayout from './components/layouts/AdminLayout';
import GuestRoute from './components/routes/GuestRoute';
import PrivateRoute from './components/routes/PrivateRoute';
import { checkAuthentication } from './services/authService';
import DatabaseExport from './pages/DatabaseExport';
import ProjectBackup from "@/pages/admin/ProjectBackup";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<GuestRoute><PublicLayout><SignupPage /></PublicLayout></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><PublicLayout><LoginPage /></PublicLayout></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><PublicLayout><ForgotPasswordPage /></PublicLayout></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><PublicLayout><ResetPasswordPage /></PublicLayout></GuestRoute>} />

        {/* Admin Routes - Protected by AdminLayout */}
        <Route path="/admin/dashboard" element={<PrivateRoute><AdminLayout><Dashboard /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/issues" element={<PrivateRoute><AdminLayout><IssuesPage /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/issues/:id" element={<PrivateRoute><AdminLayout><IssueDetailsPage /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/employees" element={<PrivateRoute><AdminLayout><EmployeesPage /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/employees/add" element={<PrivateRoute><AdminLayout><AddEmployeePage /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/employees/edit/:id" element={<PrivateRoute><AdminLayout><EditEmployeePage /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute><AdminLayout><SettingsPage /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/audit-logs" element={<PrivateRoute><AdminLayout><AuditLogsPage /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/master-data" element={<PrivateRoute><AdminLayout><MasterDataPage /></AdminLayout></PrivateRoute>} />
        <Route path="/database-export" element={<PrivateRoute><AdminLayout><DatabaseExport /></AdminLayout></PrivateRoute>} />
        
        {/* Add the new backup route */}
        <Route path="/admin/backup" element={<AdminLayout><ProjectBackup /></AdminLayout>} />
        
        {/* Not Found Route */}
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
