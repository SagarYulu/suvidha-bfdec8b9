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
    <div className="h-full flex flex-col bg-white text-yulu-dashboard-blue w-64">
      <div className="p-4 border-b border-gray-200">
        <div className="font-medium text-lg text-yulu-dashboard-blue">Yulu Suvidha Management</div>
        <div className="text-sm text-gray-600 mt-1">{username}</div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <PermissionGate permission="view:dashboard">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md transition",
              isActive 
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
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
                ? "bg-blue-100 text-yulu-dashboard-blue font-medium" 
                : "text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50"
            )}
          >
            Generate Test Data
          </NavLink>
        </PermissionGate>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onLogout}
          className="flex w-full items-center px-3 py-2 rounded-md text-yulu-dashboard-blue hover:text-yulu-dashboard-blue-dark hover:bg-blue-50 transition"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
