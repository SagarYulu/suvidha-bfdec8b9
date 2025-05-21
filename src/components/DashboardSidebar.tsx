
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  Settings,
  Layers,
  MapPin,
  Truck
  // Remove sentiment-related imports
} from "lucide-react";

const DashboardSidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Yulu Dashboard</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/schedule" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <CalendarClock className="h-5 w-5 mr-3" />
              Schedule
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/employees" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <Users className="h-5 w-5 mr-3" />
              Employees
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/fleet" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <Truck className="h-5 w-5 mr-3" />
              Fleet
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/inventory" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <Layers className="h-5 w-5 mr-3" />
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/locations" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <MapPin className="h-5 w-5 mr-3" />
              Locations
            </NavLink>
          </li>
          {/* Remove sentiment navigation item */}
          <li>
            <NavLink 
              to="/dashboard/settings" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
