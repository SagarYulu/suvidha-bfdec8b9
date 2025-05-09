
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronRight, 
  Home, 
  Users, 
  Ticket, 
  BarChart, 
  Settings, 
  Shield, 
  LogOut,
  ListTodo
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const { authState } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <Home className="w-5 h-5" />,
      permission: 'view:dashboard'
    },
    {
      name: 'Issues',
      path: '/admin/issues',
      icon: <Ticket className="w-5 h-5" />,
      permission: 'manage:issues'
    },
    {
      name: 'Assigned Tickets',
      path: '/admin/assigned-tickets',
      icon: <ListTodo className="w-5 h-5" />,
      permission: 'view:dashboard'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      permission: 'manage:users'
    },
    {
      name: 'Dashboard Users',
      path: '/admin/dashboard-users',
      icon: <Users className="w-5 h-5" />,
      permission: 'manage:users'
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart className="w-5 h-5" />,
      permission: 'manage:analytics'
    },
    {
      name: 'Security',
      path: '/admin/security',
      icon: <Shield className="w-5 h-5" />,
      permission: 'access:security'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
      permission: 'manage:settings'
    }
  ];

  return (
    <aside className="bg-white border-r h-full w-64 flex flex-col shadow-sm">
      <div className="px-4 py-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
      </div>
      <div className="flex flex-col flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center text-gray-700 px-4 py-2 my-1 rounded-lg",
                "hover:bg-gray-100 transition-colors duration-200",
                isActive && "bg-blue-50 text-blue-700 font-medium"
              )
            }
          >
            <span className="mr-3">{item.icon}</span>
            <span className="flex-1">{item.name}</span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </NavLink>
        ))}
      </div>
      <div className="px-4 py-4 border-t">
        <button
          onClick={onLogout}
          className="flex items-center text-gray-700 px-4 py-2 rounded-lg w-full hover:bg-gray-100 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
