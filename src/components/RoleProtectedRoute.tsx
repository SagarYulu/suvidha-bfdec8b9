
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardRole, DashboardPage, hasPermission } from '@/services/dashboardRoleService';

interface RoleProtectedRouteProps {
  page: DashboardPage;
  action: "view" | "edit";
  children: React.ReactNode;
  fallbackPath?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  page,
  action,
  children,
  fallbackPath = "/admin/login"
}) => {
  const { authState } = useAuth();
  const { isAuthenticated, role } = authState;
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has permission based on their role
  if (!hasPermission(role, page, action)) {
    // If they're authenticated but don't have permission, redirect to dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // User has permission, render the children
  return <>{children}</>;
};

export default RoleProtectedRoute;
