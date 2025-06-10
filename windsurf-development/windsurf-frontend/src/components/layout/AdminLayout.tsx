
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import BaseLayout from './BaseLayout';
import AdminHeader from './headers/AdminHeader';
import AdminSidebar from './sidebars/AdminSidebar';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Unable to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseLayout 
      header={
        <AdminHeader 
          title="Admin Dashboard" 
          userName={user?.name || 'Administrator'} 
        />
      } 
      sidebar={
        <AdminSidebar onLogout={handleLogout} />
      }
    >
      <Outlet />
    </BaseLayout>
  );
};

export default AdminLayout;
