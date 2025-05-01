
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  TicketCheck,
  Users,
  BarChart3,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  ChevronUp,
  UserPlus,
  KeyRound
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

interface AdminSidebarProps {
  onLogout: () => void;
}

interface SidebarSubmenuProps {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
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

const SidebarSubmenu: React.FC<SidebarSubmenuProps> = ({ label, icon: Icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = window.location.pathname.startsWith(`/admin/${label.toLowerCase().replace(/\s+/g, '-')}`);
  
  return (
    <div className="border-l-2 transition-colors border-transparent">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between py-3 px-6 text-sm font-medium transition-colors",
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center">
          <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-500" : "text-gray-400")} />
          {label}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="ml-8 border-l border-gray-200 pl-2">
          {children}
        </div>
      )}
    </div>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  return (
    <div className="w-64 bg-white border-r hidden md:block overflow-y-auto h-full flex flex-col">
      <div className="py-6 px-6 border-b">
        <Link to="/admin/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-blue-700">Yulu Suvidha</span>
        </Link>
      </div>

      <div className="py-3 flex-grow">
        <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink href="/admin/issues" icon={TicketCheck} label="Tickets" />
        <SidebarLink href="/admin/users" icon={Users} label="Users" />
        <SidebarLink href="/admin/analytics" icon={BarChart3} label="Analytics" />
        
        <SidebarSubmenu label="Security Management" icon={Shield}>
          <SidebarLink href="/admin/dashboard-users" icon={UserPlus} label="Add Dashboard Users" />
          <SidebarLink href="/admin/access-control" icon={KeyRound} label="Manage Roles" />
        </SidebarSubmenu>
        
        <SidebarLink href="/admin/settings" icon={Settings} label="Settings" />
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 hover:text-gray-700"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
