
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import DatabaseExport from '@/pages/DatabaseExport';

const Exports: React.FC = () => {
  return (
    <AdminLayout title="Data Exports">
      <DatabaseExport />
    </AdminLayout>
  );
};

export default Exports;
