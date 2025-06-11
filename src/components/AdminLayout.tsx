
import React from 'react';
import BaseLayout from './layouts/BaseLayout';
import AdminHeader from './layouts/headers/AdminHeader';
import AdminSidebar from './layouts/sidebars/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  return (
    <BaseLayout
      header={<AdminHeader />}
      sidebar={<AdminSidebar />}
      className="bg-gray-50"
    >
      <div className="space-y-6">
        {title && (
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </BaseLayout>
  );
};

export default AdminLayout;
