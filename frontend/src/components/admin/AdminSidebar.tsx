
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Users, 
  BarChart3, 
  Upload, 
  MessageSquare, 
  FileText, 
  UserCog, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      title: 'Issues',
      icon: AlertCircle,
      href: '/admin/issues',
    },
    {
      title: 'Employees',
      icon: Users,
      href: '/admin/employees',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
    },
    {
      title: 'Bulk Upload',
      icon: Upload,
      href: '/admin/bulk-upload',
    },
    {
      title: 'Feedback',
      icon: MessageSquare,
      href: '/admin/feedback',
    },
    {
      title: 'Reports',
      icon: FileText,
      href: '/admin/reports',
    },
    {
      title: 'Users',
      icon: UserCog,
      href: '/admin/users',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ];

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
