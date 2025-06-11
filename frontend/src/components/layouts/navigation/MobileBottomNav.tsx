
import { NavLink } from 'react-router-dom';
import { Home, AlertCircle, Plus, MessageSquare, User } from 'lucide-react';

const MobileBottomNav = () => {
  const navItems = [
    { name: 'Issues', href: '/mobile/issues', icon: AlertCircle },
    { name: 'New Issue', href: '/mobile/issues/new', icon: Plus },
    { name: 'Feedback', href: '/mobile/feedback', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 text-xs ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
