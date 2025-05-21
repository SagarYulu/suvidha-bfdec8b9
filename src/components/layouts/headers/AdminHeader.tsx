
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminHeaderProps {
  title: string;
  userName?: string;
  showBackButton?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, userName, showBackButton = false }) => {
  const { authState } = useAuth();
  const displayName = userName || authState.user?.name || 'Admin User';
  const userInitial = displayName[0] || 'A';
  
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h1 className="text-xl font-medium text-blue-700">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">{displayName}</span>
        <Avatar className="h-8 w-8 bg-blue-700 text-white">
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default AdminHeader;
