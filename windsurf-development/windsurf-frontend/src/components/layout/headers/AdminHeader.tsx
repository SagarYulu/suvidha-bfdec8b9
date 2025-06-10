
import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
  userName: string;
  showBackButton?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title, 
  userName, 
  showBackButton = false 
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="text-sm text-gray-600">
            Welcome, {userName}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
