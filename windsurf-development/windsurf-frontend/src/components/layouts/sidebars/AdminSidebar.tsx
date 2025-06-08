
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  TicketCheck,
  Users,
  BarChart3,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  UserPlus,
  Ticket,
  BarChart2,
  TestTube,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

interface AdminSidebarProps {
  onLogout: () => void;
}

interface DropdownMenuProps {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  toggleOpen: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon: Icon, label, isActive: forcedActiveState }) => {
  const location = useLocation();
  const isActive = forcedActiveState !== undefined ? forcedActiveState : location.pathname === href;

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

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  label, 
  icon: Icon, 
  children, 
  isOpen, 
  toggleOpen 
}) => {
  const isActive = isOpen || React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child) && 
        'props' in child && 
        child.props && 
        typeof child.props === 'object' && 
        child.props !== null &&
        'href' in child.props && 
        typeof child.props.href === 'string') {
      return window.location.pathname === child.props.href;
    }
    return false;
  });

  return (
    <div className="flex flex-col">
      <button 
        onClick={toggleOpen}
        className={cn(
          "flex items-center justify-between py-3 px-6 text-sm font-medium border-l-2 transition-colors",
          isActive
            ? "bg-blue-50 border-blue-500 text-blue-700"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center">
          <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-500" : "text-gray-400")} />
          {label}
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform", 
            isOpen ? "transform rotate-180" : ""
          )} 
        />
      </button>
      {isOpen && (
        <div className="bg-gray-50 pl-4">
          {children}
        </div>
      )}
    </div>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    dashboardUsers: false,
    tickets: false,
    analytics: false
  });
  const { logout, authState } = useAuth();
  const location = useLocation();

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Determine active link based on current location
  useEffect(() => {
    // Check if we're in a subpath and open the corresponding dropdown
    if (location.pathname.includes('/admin/dashboard-users')) {
      setOpenMenus(prev => ({
        ...prev,
        dashboardUsers: true
      }));
    }
    
    // Check if we're in tickets pages
    if (location.pathname.includes('/admin/issues') || location.pathname.includes('/admin/assigned-issues')) {
      setOpenMenus(prev => ({
        ...prev,
        tickets: true
      }));
    }
    
    // Check if we're in analytics pages
    if (location.pathname.includes('/admin/analytics')) {
      setOpenMenus(prev => ({
        ...prev,
        analytics: true
      }));
    }
  }, [location]);

  // Create a proper logout handler function
  const handleLogout = async () => {
    try {
      await logout();
      onLogout(); // Call the passed onLogout prop
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-64 bg-white border-r hidden md:block overflow-y-auto h-full flex flex-col">
      <div className="py-6 px-6 border-b">
        <Link to="/admin/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-blue-700">Windsurf Management</span>
        </Link>
      </div>

      <div className="py-3 flex-grow">
        {/* Dashboard */}
        <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />

        {/* Test Dashboard */}
        <SidebarLink href="/admin/test-dashboard" icon={TestTube} label="Test Dashboard" />
        
        {/* Tickets dropdown */}
        <DropdownMenu 
          label="Tickets" 
          icon={TicketCheck} 
          isOpen={openMenus.tickets} 
          toggleOpen={() => toggleMenu('tickets')}
        >
          <SidebarLink 
            href="/admin/issues" 
            icon={TicketCheck} 
            label="All Tickets" 
            isActive={location.pathname === "/admin/issues"}
          />
          
          <SidebarLink 
            href="/admin/assigned-issues" 
            icon={Ticket} 
            label="Assigned To Me" 
            isActive={location.pathname === "/admin/assigned-issues"}
          />
        </DropdownMenu>
        
        {/* Users */}
        <SidebarLink href="/admin/users" icon={Users} label="Users" />
        
        {/* Analytics dropdown */}
        <DropdownMenu 
          label="Analytics" 
          icon={BarChart3} 
          isOpen={openMenus.analytics} 
          toggleOpen={() => toggleMenu('analytics')}
        >
          <SidebarLink 
            href="/admin/analytics" 
            icon={BarChart3} 
            label="Issue Analytics" 
            isActive={location.pathname === "/admin/analytics"}
          />
          
          <SidebarLink 
            href="/admin/feedback-analytics" 
            icon={BarChart2} 
            label="Feedback Analytics" 
            isActive={location.pathname === "/admin/feedback-analytics"}
          />
        </DropdownMenu>
        
        {/* Dashboard Users dropdown */}
        <DropdownMenu 
          label="Dashboard Users" 
          icon={Users} 
          isOpen={openMenus.dashboardUsers} 
          toggleOpen={() => toggleMenu('dashboardUsers')}
        >
          <SidebarLink 
            href="/admin/dashboard-users/add" 
            icon={UserPlus} 
            label="Add Dashboard User" 
            isActive={location.pathname === "/admin/dashboard-users/add"}
          />
        </DropdownMenu>
        
        {/* Access Control */}
        <SidebarLink href="/admin/access-control" icon={Shield} label="Access Control" />
        
        {/* Settings */}
        <SidebarLink href="/admin/settings" icon={Settings} label="Settings" />
      </div>

      <div className="p-4 border-t">
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
  );
};

export default AdminSidebar;
