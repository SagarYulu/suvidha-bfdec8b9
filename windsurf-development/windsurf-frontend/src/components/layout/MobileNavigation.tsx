
import React from 'react';
import { Home, FileText, User, MessageSquare, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

interface NavItem {
  id: string;
  label: string;
  labelHindi: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

interface MobileNavigationProps {
  language: 'en' | 'hi';
  notificationCount?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  language, 
  notificationCount = 0 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      labelHindi: 'होम',
      icon: Home,
      path: '/mobile'
    },
    {
      id: 'issues',
      label: 'My Issues',
      labelHindi: 'मेरी समस्याएं',
      icon: FileText,
      path: '/mobile/issues'
    },
    {
      id: 'create',
      label: 'Report',
      labelHindi: 'रिपोर्ट',
      icon: MessageSquare,
      path: '/mobile/create-issue'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      labelHindi: 'सूचनाएं',
      icon: Bell,
      path: '/mobile/notifications',
      badge: notificationCount
    },
    {
      id: 'profile',
      label: 'Profile',
      labelHindi: 'प्रोफ़ाइल',
      icon: User,
      path: '/mobile/profile'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/mobile') {
      return location.pathname === '/mobile' || location.pathname === '/mobile/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 relative ${
                active 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 truncate w-full text-center ${
                active ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {language === 'hi' ? item.labelHindi : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
