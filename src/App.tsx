
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import IssuesPage from './pages/admin/Issues';
import IssueDetailsPage from './pages/admin/IssueDetails';
import SettingsPage from './pages/admin/Settings';
import NotFoundPage from './pages/NotFound';
import BaseLayout from './components/layouts/BaseLayout';
import AdminLayout from './components/AdminLayout';
import DatabaseExport from './pages/DatabaseExport';
import ProjectBackup from "@/pages/admin/ProjectBackup";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminLayout title="Dashboard"><Dashboard /></AdminLayout>} />
        <Route path="/admin/issues" element={<AdminLayout title="Issues"><IssuesPage /></AdminLayout>} />
        <Route path="/admin/issues/:id" element={<AdminLayout title="Issue Details"><IssueDetailsPage /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout title="Settings"><SettingsPage /></AdminLayout>} />
        <Route path="/admin/backup" element={<AdminLayout title="Project Backup"><ProjectBackup /></AdminLayout>} />
        <Route path="/database-export" element={<AdminLayout title="Database Export"><DatabaseExport /></AdminLayout>} />
        
        {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
