
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
    <div className="h-full flex flex-col bg-gray-900 text-white w-64">
      <div className="p-4 border-b border-gray-800">
        <div className="font-medium text-lg text-gray-100">Yulu HR Portal</div>
        <div className="text-sm text-gray-400 mt-1">{username}</div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <PermissionGate permission="view:dashboard">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Dashboard
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="view:dashboard">
          <NavLink 
            to="/admin/ticket-trends" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Ticket Trend Analysis
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:issues">
          <NavLink 
            to="/admin/issues" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            All Tickets
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:issues">
          <NavLink 
            to="/admin/assigned-issues" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Assigned to Me
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:users">
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Users
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Analytics
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/feedback-analytics" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Feedback Analytics
          </NavLink>
        </PermissionGate>

        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/resolution-feedback" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Resolution Feedback
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:analytics">
          <NavLink 
            to="/admin/sentiment-analysis" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Sentiment Analysis
          </NavLink>
        </PermissionGate>

        <PermissionGate permission="create:dashboardUser">
          <NavLink 
            to="/admin/dashboard-users/add" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Admin Users
          </NavLink>
        </PermissionGate>

        <PermissionGate permission="access:security">
          <NavLink 
            to="/admin/access-control" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Access Control
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:settings">
          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Settings
          </NavLink>
        </PermissionGate>
        
        <PermissionGate permission="manage:testdata">
          <NavLink 
            to="/admin/test-data-generator" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-gray-800 text-white font-medium" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            Generate Test Data
          </NavLink>
        </PermissionGate>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={onLogout}
          className="flex w-full items-center px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
