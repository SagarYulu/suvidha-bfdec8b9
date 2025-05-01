
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { DashboardPage } from '@/services/dashboardRoleService';

import BaseLayout from './layouts/BaseLayout';
import AdminHeader from './layouts/headers/AdminHeader';
import AdminSidebar from './layouts/sidebars/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showBackButton?: boolean;
  requiredPage?: DashboardPage;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  className,
  showBackButton = true,
  requiredPage
}) => {
  const { logout, user, authState } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/admin/login');
      return;
    }
  }, [authState.isAuthenticated, navigate]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const header = (
    <AdminHeader 
      title={title} 
      userName={user?.name || 'Administrator'} 
      showBackButton={showBackButton}
    />
  );
  
  const sidebar = <AdminSidebar onLogout={handleLogout} />;

  return (
    <BaseLayout 
      header={header} 
      sidebar={sidebar}
      className={className}
    >
      {children}
    </BaseLayout>
  );
};

export default AdminLayout;
