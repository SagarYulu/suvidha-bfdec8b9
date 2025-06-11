
import { NavLink } from 'react-router-dom';
import { useRBAC } from '@/contexts/RBACContext';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Users, 
  BarChart3,
  UserCheck,
  MessageSquare
} from 'lucide-react';

const AdminSidebar = () => {
  const { hasPermission } = useRBAC();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      permission: 'view_dashboard'
    },
    {
      name: 'Issues',
      href: '/admin/issues',
      icon: AlertCircle,
      permission: 'view_issues'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      permission: 'view_users'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      permission: 'view_analytics'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Yulu Admin</h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navigationItems.map((item) => {
            if (!hasPermission(item.permission)) {
              return null;
            }
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
