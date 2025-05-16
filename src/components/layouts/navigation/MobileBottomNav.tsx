
import React from "react";
import { Home, FilePlus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();

  return (
    <nav className="bg-white border-t fixed bottom-0 w-full">
      <div className="flex justify-between items-center">
        {/* Left section - Home */}
        <div className="flex-1 flex justify-center">
          <button 
            onClick={onHomeClick}
            className={cn(
              "flex flex-col items-center py-3",
              location.pathname === "/mobile/issues" && "text-yulu-cyan"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
        </div>
        
        {/* Middle section - Raise ticket */}
        <div className="flex-grow-0 flex justify-center -mt-5 mx-4">
          <button
            onClick={onNewIssueClick}
            className="bg-yulu-cyan hover:bg-yulu-cyan-dark text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md"
          >
            <FilePlus className="h-6 w-6" />
            <span className="text-xs mt-1">Raise ticket</span>
          </button>
        </div>
        
        {/* Right section - Logout */}
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
