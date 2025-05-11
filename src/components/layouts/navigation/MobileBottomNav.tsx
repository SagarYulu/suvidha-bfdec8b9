
import React from "react";
import { Home, FilePlus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <nav className="bg-white border-t fixed bottom-0 w-full">
      <div className="flex justify-around items-center">
        <div className="flex-1 flex justify-center">
          <button 
            onClick={onHomeClick}
            className="flex flex-col items-center py-3"
          >
            <Home className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1 text-gray-600">Home</span>
          </button>
        </div>
        
        <div className="flex justify-center -mt-5">
          <button
            onClick={onNewIssueClick}
            className="bg-[#00CEDE] text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md"
          >
            <FilePlus className="h-6 w-6" />
            <span className="text-xs mt-1">New</span>
          </button>
        </div>
        
        <div className="flex-1 flex justify-center">
          <button
            onClick={onLogoutClick}
            className="flex flex-col items-center py-3"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1 text-gray-600">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
