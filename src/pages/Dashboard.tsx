
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import AdminDashboard from '@/pages/admin/Dashboard';
import NotFound from '@/pages/NotFound';

// Import other needed pages for Dashboard routes
import Issues from '@/pages/admin/Issues';
import AssignedIssues from '@/pages/admin/AssignedIssues';
import IssueDetails from '@/pages/admin/IssueDetails';
import Settings from '@/pages/admin/Settings';
import Users from '@/pages/admin/Users';

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="ml-64 flex-1 p-6">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetails />} />
          <Route path="/assigned" element={<AssignedIssues />} />
          <Route path="/employees" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          {/* Redirect removed sentiment route to dashboard */}
          <Route path="/sentiment" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
