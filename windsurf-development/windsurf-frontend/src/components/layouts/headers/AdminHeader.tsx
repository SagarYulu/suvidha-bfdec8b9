
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  userName?: string;
  showBackButton?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title, 
  userName, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        {userName && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {userName}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
