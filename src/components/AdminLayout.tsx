
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  LayoutDashboard,
  TicketCheck,
  Users,
  BarChart3,
  LogOut,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon: Icon, label }) => {
  const isActive = window.location.pathname === href;

  return (
    <Link
      to={href}
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

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
          <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink href="/admin/issues" icon={TicketCheck} label="Issues" />
          <SidebarLink href="/admin/users" icon={Users} label="Users" />
          <SidebarLink href="/admin/analytics" icon={BarChart3} label="Analytics" />
          <SidebarLink href="/admin/settings" icon={Settings} label="Settings" />
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
                Administrator
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLayout;
