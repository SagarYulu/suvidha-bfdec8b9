
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, CalendarDays, Map, User } from "lucide-react";

const MobileNavigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 z-50">
      <div className="flex justify-around items-center">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
          end
        >
          <Home className="h-6 w-6 mb-1" />
          Home
        </NavLink>
        <NavLink 
          to="/schedule" 
          className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <CalendarDays className="h-6 w-6 mb-1" />
          Schedule
        </NavLink>
        <NavLink 
          to="/map" 
          className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <Map className="h-6 w-6 mb-1" />
          Map
        </NavLink>
        {/* Remove sentiment navigation item if it exists */}
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <User className="h-6 w-6 mb-1" />
          Profile
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileNavigation;
