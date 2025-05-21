
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Database,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };
  
  // Navigation items with permission checks
  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      permission: 'view:dashboard'
    },
    { 
      path: '/admin/issues', 
      label: 'Issues',
      icon: <FileText className="h-5 w-5" />,
      permission: 'manage:issues'
    },
    { 
      path: '/admin/employees', 
      label: 'Employees',
      icon: <Users className="h-5 w-5" />,
      permission: 'manage:employees'
    },
    { 
      path: '/admin/users', 
      label: 'Users',
      icon: <Users className="h-5 w-5" />,
      permission: 'manage:users'
    },
    { 
      path: '/admin/sentiment', 
      label: 'Sentiment Analysis',
      icon: <BarChart3 className="h-5 w-5" />,
      permission: 'manage:analytics'
    },
    { 
      path: '/admin/resolution-feedback', 
      label: 'Resolution Feedback',
      icon: <MessageSquare className="h-5 w-5" />,
      permission: 'manage:analytics'
    },
    { 
      path: '/admin/master-data', 
      label: 'Master Data',
      icon: <Database className="h-5 w-5" />,
      permission: 'manage:master-data'
    },
    { 
      path: '/admin/settings', 
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      permission: 'manage:settings'
    },
  ];
  
  // Filter out items the user doesn't have permission to see
  const filteredNavItems = navItems.filter(item => !item.permission || hasPermission(item.permission));
  
  return (
    <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-4">
          {filteredNavItems.map((item) => (
            <li key={item.path} className="px-4 py-2">
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
