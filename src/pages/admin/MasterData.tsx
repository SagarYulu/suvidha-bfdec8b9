
import React from 'react';
import AdminLayout from '@/components/AdminLayout';

const MasterData: React.FC = () => {
  return (
    <AdminLayout title="Master Data" requiredPermission="manage:master-data">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Master Data Management</h2>
        <p className="text-gray-500">
          This page is currently under construction. Please check back later.
        </p>
      </div>
    </AdminLayout>
  );
};

export default MasterData;
