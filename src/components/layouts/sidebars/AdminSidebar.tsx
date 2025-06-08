
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  Database,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard'
    },
    {
      title: 'Issues',
      icon: FileText,
      path: '/admin/issues'
    },
    {
      title: 'Users',
      icon: Users,
      path: '/admin/users'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics'
    },
    {
      title: 'Feedback Analytics',
      icon: MessageSquare,
      path: '/admin/feedback-analytics'
    },
    {
      title: 'Master Data',
      icon: Database,
      path: '/admin/master-data'
    },
    {
      title: 'Access Control',
      icon: Shield,
      path: '/admin/access-control'
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-yulu-dashboard-blue">Grievance Portal</h2>
        <p className="text-sm text-gray-600">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-yulu-dashboard-blue text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="font-medium">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
