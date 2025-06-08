
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate("/mobile/issues");
  };

  const handleNewIssue = () => {
    navigate("/mobile/new-issue");
  };

  const handleProfile = () => {
    navigate("/mobile/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="flex items-center justify-between p-4 pt-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-semibold">Windsurf Mobile</h1>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewIssue}
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">New Issue</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfile}
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
