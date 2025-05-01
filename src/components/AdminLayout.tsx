
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import BaseLayout from './layouts/BaseLayout';
import AdminHeader from './layouts/headers/AdminHeader';
import AdminSidebar from './layouts/sidebars/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const header = <AdminHeader title={title} userName={user?.name || 'Administrator'} />;
  
  const sidebar = <AdminSidebar onLogout={handleLogout} />;

  return (
    <BaseLayout header={header} sidebar={sidebar}>
      {children}
    </BaseLayout>
  );
};

export default AdminLayout;
