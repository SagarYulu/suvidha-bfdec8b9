
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onMenuClick?: () => void;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  title,
  children,
  showBackButton = true,
  onMenuClick
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-blue-700 mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700"
          >
            <Bell className="h-5 w-5" />
          </Button>
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="text-white hover:bg-blue-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
