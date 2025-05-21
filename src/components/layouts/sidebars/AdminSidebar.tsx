
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import PermissionGate from '@/components/rbac/PermissionGate';
import { LogOut } from 'lucide-react';

interface AdminSidebarProps {
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const { authState } = useAuth();
  const username = authState.user?.name || "Administrator";
  
  return (
    <div className="h-full flex flex-col bg-white shadow-md border-r border-gray-200 w-64">
      <div className="p-4">
        <div className="font-medium text-lg text-blue-700">Yulu Suvidha Management</div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <PermissionGate permission="view:dashboard">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Dashboard
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="view:dashboard">
          <NavLink 
            to="/admin/ticket-trends" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Ticket Trend Analysis
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:issues">
          <NavLink 
            to="/admin/issues" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            All Tickets
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:issues">
          <NavLink 
            to="/admin/assigned-issues" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Assigned to Me
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:users">
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Users
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Analytics
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/feedback-analytics" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Feedback Analytics
          </NavLink>
        </PermissionGate>

        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/resolution-feedback" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Resolution Feedback
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/sentiment-analysis" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Sentiment Analysis
          </NavLink>
        </PermissionGate>

        <PermissionGate permission="create:dashboardUser">
          <NavLink 
            to="/admin/dashboard-users/add" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Admin Users
          </NavLink>
        </PermissionGate>

        <PermissionGate permission="access:security">
          <NavLink 
            to="/admin/access-control" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Access Control
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:settings">
          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Settings
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:testdata">
          <NavLink 
            to="/admin/test-data-generator" 
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            Generate Test Data
          </NavLink>
        </PermissionGate>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">{username}</div>
        <button 
          onClick={onLogout}
          className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
