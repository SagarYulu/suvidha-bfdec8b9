
import React from 'react';
import AdminLayout from '@/components/AdminLayout';

const UserPermissions: React.FC = () => {
  return (
    <AdminLayout title="User Permissions" requiredPermission="manage:permissions">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">User Permissions</h2>
        <p className="text-gray-500">
          This page is currently under construction. Please check back later.
        </p>
      </div>
    </AdminLayout>
  );
};

export default UserPermissions;
