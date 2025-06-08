
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Home,
  TestTube,
  ChevronDown,
  ChevronRight,
  Shield,
  UserCog,
  MessageSquare,
  TicketCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    tickets: true,
    analytics: true,
    dashboardUsers: true
  });

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isMenuActive = (paths: string[]) => paths.some(path => location.pathname === path);

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-8">Yulu Suvidha Management</h2>
        
        <nav className="space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/dashboard')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          {/* Test Dashboard */}
          <NavLink
            to="/admin/test-dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/test-dashboard')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TestTube className="h-5 w-5" />
            <span>Test Dashboard</span>
          </NavLink>

          {/* Tickets Dropdown */}
          <div>
            <button
              onClick={() => toggleMenu('tickets')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                isMenuActive(['/admin/issues', '/admin/assigned-issues'])
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5" />
                <span>Tickets</span>
              </div>
              {expandedMenus.tickets ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedMenus.tickets && (
              <div className="ml-4 mt-1 space-y-1">
                <NavLink
                  to="/admin/issues"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/admin/issues')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TicketCheck className="h-4 w-4" />
                  <span>All Tickets</span>
                </NavLink>
                <NavLink
                  to="/admin/assigned-issues"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/admin/assigned-issues')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <UserCog className="h-4 w-4" />
                  <span>Assigned To Me</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Users */}
          <NavLink
            to="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/users')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </NavLink>

          {/* Analytics Dropdown */}
          <div>
            <button
              onClick={() => toggleMenu('analytics')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                isMenuActive(['/admin/analytics', '/admin/issue-analytics'])
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </div>
              {expandedMenus.analytics ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedMenus.analytics && (
              <div className="ml-4 mt-1 space-y-1">
                <NavLink
                  to="/admin/issue-analytics"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/admin/issue-analytics')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Issue Analytics</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Dashboard Users Dropdown */}
          <div>
            <button
              onClick={() => toggleMenu('dashboardUsers')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                isMenuActive(['/admin/dashboard-users/add'])
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UserCog className="h-5 w-5" />
                <span>Dashboard Users</span>
              </div>
              {expandedMenus.dashboardUsers ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedMenus.dashboardUsers && (
              <div className="ml-4 mt-1 space-y-1">
                <NavLink
                  to="/admin/dashboard-users/add"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/admin/dashboard-users/add')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <UserCog className="h-4 w-4" />
                  <span>Add Dashboard User</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Access Control */}
          <NavLink
            to="/admin/access-control"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/access-control')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Access Control</span>
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/admin/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/settings')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </NavLink>

          {/* Feedback Analytics */}
          <NavLink
            to="/admin/feedback-analytics"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/feedback-analytics')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Feedback Analytics</span>
          </NavLink>
        </nav>
        
        <div className="mt-8 pt-8 border-t">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
