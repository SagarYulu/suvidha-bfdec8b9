import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ChevronLeft,
  LayoutDashboard,
  TicketCheck,
  Users,
  BarChart3,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  requiresRole?: Array<"hr_admin" | "city_head" | "ops">;
}

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  showForRoles: Array<"hr_admin" | "city_head" | "ops">;
  viewOnly?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon: Icon, label, showForRoles, viewOnly }) => {
  const { authState } = useAuth();
  const isActive = window.location.pathname === href;
  
  // Don't render the link if the user doesn't have the required role
  if (!authState.user?.role || !showForRoles.includes(authState.user.role as any)) {
    return null;
  }
  
  // If this is a view-only link and the user is city_head or ops, redirect to a view-only version
  let linkHref = href;
  if (viewOnly && (authState.role === "city_head" || authState.role === "ops")) {
    // For pages that should be view-only, we could append a query param or use a different route
    // Here we're keeping the same route but this would be handled in the page component
    linkHref = href;
  }

  return (
    <Link
      to={linkHref}
      className={cn(
        "flex items-center py-3 px-6 text-sm font-medium border-l-2 transition-colors",
        isActive
          ? "bg-blue-50 border-blue-500 text-blue-700"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      )}
    >
      <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-500" : "text-gray-400")} />
      {label}
    </Link>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, requiresRole = ["hr_admin", "city_head", "ops"] }) => {
  const { logout, authState } = useAuth();
  const navigate = useNavigate();
  
  // Check if the user is authenticated and has the required role
  if (!authState.isAuthenticated) {
    return <Navigate to="/mobile/login" />;
  }

  // Check if the user has any of the required roles for this page
  if (!requiresRole.includes(authState.role as any)) {
    return <Navigate to="/admin/dashboard" />;
  }
  
  // Additional check to prevent write access to certain pages for city_head and ops roles
  // If the current page is /admin/users and the user is not hr_admin, redirect to dashboard
  const isNonViewablePage = window.location.pathname.includes('/admin/users');
  if (isNonViewablePage && authState.role !== "hr_admin") {
    return <Navigate to="/admin/dashboard" />;
  }
  
  const handleLogout = async () => {
    await logout();
    navigate('/mobile/login');
  };

  // Map user role to a display name
  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case 'hr_admin':
        return 'HR Admin';
      case 'city_head':
        return 'City Head';
      case 'ops':
        return 'Operations';
      default:
        return 'Administrator';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r hidden md:block overflow-y-auto">
        <div className="py-6 px-6 border-b">
          <Link to="/admin/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-blue-700">Yulu Admin</span>
          </Link>
        </div>

        <div className="py-3">
          <SidebarLink 
            href="/admin/dashboard" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            showForRoles={["hr_admin", "city_head", "ops"]}
          />
          <SidebarLink 
            href="/admin/issues" 
            icon={TicketCheck} 
            label="Issues" 
            showForRoles={["hr_admin", "city_head", "ops"]}
            viewOnly={true}
          />
          <SidebarLink 
            href="/admin/users" 
            icon={Users} 
            label="Users" 
            showForRoles={["hr_admin"]} // Only HR Admin can access Users page
          />
          <SidebarLink 
            href="/admin/analytics" 
            icon={BarChart3} 
            label="Analytics" 
            showForRoles={["hr_admin", "city_head", "ops"]}
            viewOnly={true}
          />
        </div>

        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="md:hidden mr-4">
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {authState.user?.name} ({getRoleDisplayName(authState.role as string)})
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {authState.user?.name ? authState.user.name[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {/* Show view-only message for city_head and ops roles */}
          {(authState.role === "city_head" || authState.role === "ops") && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              You have view-only access to this section. Contact HR Admin for any changes.
            </div>
          )}
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLayout;
