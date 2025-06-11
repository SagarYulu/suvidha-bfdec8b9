
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3, 
  Upload,
  MessageSquare,
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { authState } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/issues', label: 'Issues', icon: Ticket },
    { path: '/admin/employees', label: 'Employees', icon: Users },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/bulk-upload', label: 'Bulk Upload', icon: Upload },
    { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
  ];

  // Add admin-only items
  if (authState.role === 'admin') {
    menuItems.push(
      { path: '/admin/users', label: 'User Management', icon: Shield },
      { path: '/admin/settings', label: 'Settings', icon: Settings }
    );
  }

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg z-40">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
