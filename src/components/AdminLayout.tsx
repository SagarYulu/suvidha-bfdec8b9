
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import BaseLayout from './layouts/BaseLayout';
import AdminHeader from './layouts/headers/AdminHeader';
import AdminSidebar from './layouts/sidebars/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showBackButton?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  className,
  showBackButton = true
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Set a short timeout to ensure auth state is loaded
    const checkAuth = setTimeout(() => {
      // Check if user is authenticated and has admin role
      if (!authState.isAuthenticated) {
        console.log("Not authenticated, redirecting to admin login");
        navigate("/admin/login", { replace: true });
        return;
      }
      
      // Check if user has admin or security-admin role
      if (authState.role !== "admin" && authState.role !== "security-admin") {
        console.log("Not an admin user, redirecting to home");
        navigate("/", { replace: true });
        return;
      }
      
      console.log("Admin authenticated:", authState.user);
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [authState, navigate]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  const header = (
    <AdminHeader 
      title={title} 
      userName={authState.user?.name || 'Administrator'} 
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
