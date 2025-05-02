
import React from "react";
import { Home, FilePlus, LogOut } from "lucide-react";

interface MobileBottomNavProps {
  onHomeClick: () => void;
  onNewIssueClick: () => void;
  onLogoutClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onHomeClick,
  onNewIssueClick,
  onLogoutClick,
}) => {
  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full">
      <div className="flex justify-around">
        <button 
          onClick={onHomeClick}
          className="flex flex-col items-center py-3 flex-1"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          onClick={onNewIssueClick}
          className="flex flex-col items-center py-3 flex-1"
        >
          <FilePlus className="h-5 w-5" />
          <span className="text-xs mt-1">Raise Ticket</span>
        </button>
        <button
          onClick={onLogoutClick}
          className="flex flex-col items-center py-3 flex-1"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
