
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Ticket, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Issues', href: '/admin/issues', icon: Ticket },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="w-64 bg-gray-900 min-h-screen">
      <div className="p-6">
        <div className="text-white text-xl font-bold">Admin Panel</div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-2
                ${isActive(item.href)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                `}
              />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-3">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
