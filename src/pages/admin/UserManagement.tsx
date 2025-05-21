
import React from 'react';
import AdminLayout from '@/components/AdminLayout';

const UserManagement: React.FC = () => {
  return (
    <AdminLayout title="User Management" requiredPermission="manage:users">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-gray-500">
          This page is currently under construction. Please check back later.
        </p>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
