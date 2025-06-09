
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  userName: string;
  onLogout?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, userName, onLogout }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-700">{userName}</span>
        </div>
        
        {onLogout && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
