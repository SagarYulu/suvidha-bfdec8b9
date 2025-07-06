
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Plus, Clock, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const navItems = [
    { to: '/mobile', icon: Home, label: 'Home' },
    { to: '/mobile/new-issue', icon: Plus, label: 'New Issue' },
    { to: '/mobile/issues', icon: Clock, label: 'My Issues' },
    { to: '/mobile/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-1 ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`
            }
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
