
import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import ExportControls from '@/components/admin/ExportControls';

const Exports: React.FC = () => {
  const { hasPermission } = useRBAC();

  if (!hasPermission('export_data')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to export data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExportControls 
          entityType="issues" 
          title="Export Issues"
        />
        <ExportControls 
          entityType="users" 
          title="Export Users"
        />
      </div>
    </div>
  );
};

export default Exports;
