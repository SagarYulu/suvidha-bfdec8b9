
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, Plus, LogOut } from 'lucide-react';

const MobileLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/mobile/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-yulu-dashboard-blue text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Employee Portal</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Hi, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-16">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex">
          <Link
            to="/mobile/issues"
            className="flex-1 flex flex-col items-center py-3 px-4 text-gray-600 hover:text-yulu-dashboard-blue"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Issues</span>
          </Link>
          
          <Link
            to="/mobile/create-issue"
            className="flex-1 flex flex-col items-center py-3 px-4 text-gray-600 hover:text-yulu-dashboard-blue"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs mt-1">Create</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
