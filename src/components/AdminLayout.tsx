
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast"; 

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
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated and has the right role
    const checkAuth = () => {
      const { isAuthenticated, role } = authState;
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to admin login");
        navigate("/admin/login", { replace: true });
        return;
      }
      
      // Check admin roles - include all valid admin roles
      const isAdmin = role === "admin" || role === "security-admin" || role === "Super Admin";
      
      if (!isAdmin) {
        console.log("Not an admin user, role:", role, "redirecting to home");
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }
      
      console.log("Admin authenticated:", authState.user, "with role:", role);
      setAuthorized(true);
    };
    
    checkAuth();
  }, [authState, navigate]);

  const handleLogout = async () => {
    const { logout } = useAuth();
    await logout();
    navigate('/admin/login', { replace: true });
  };

  // Show loading state while checking authentication
  if (!authorized) {
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
