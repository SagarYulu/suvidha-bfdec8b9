
import React from 'react';
import BaseLayout from './layouts/BaseLayout';
import AdminHeader from './layouts/headers/AdminHeader';
import AdminSidebar from './layouts/sidebars/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Admin Dashboard" }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <BaseLayout
      header={
        <AdminHeader 
          title={title}
          userName={authState.user?.name || 'Admin'}
        />
      }
      sidebar={
        <AdminSidebar 
          onLogout={handleLogout}
        />
      }
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
