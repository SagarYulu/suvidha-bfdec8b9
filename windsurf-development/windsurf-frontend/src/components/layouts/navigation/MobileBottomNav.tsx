
import React from 'react';
import { Home, Plus, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
  onHomeClick: () => void;
  onNewIssueClick: () => void;
  onLogoutClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onHomeClick,
  onNewIssueClick,
  onLogoutClick
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onHomeClick}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewIssueClick}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">New Issue</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogoutClick}
          className="flex flex-col items-center gap-1 h-auto py-2 text-red-600"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
