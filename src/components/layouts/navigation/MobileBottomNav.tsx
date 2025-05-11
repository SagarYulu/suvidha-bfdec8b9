
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
    <nav className="bg-white border-t border-gray-100 fixed bottom-0 w-full shadow-lg rounded-t-[25px]">
      <div className="flex justify-around">
        <button 
          onClick={onHomeClick}
          className="flex flex-col items-center py-3 flex-1"
        >
          <Home className="h-5 w-5 text-[#00B6CB]" />
          <span className="text-xs mt-1 text-gray-600">Home</span>
        </button>
        <button
          onClick={onNewIssueClick}
          className={cn(
            "flex flex-col items-center py-2 px-5 -mt-5",
            "bg-[#00B6CB] rounded-full text-white shadow-lg"
          )}
        >
          <FilePlus className="h-6 w-6" />
          <span className="text-xs mt-1">New</span>
        </button>
        <button
          onClick={onLogoutClick}
          className="flex flex-col items-center py-3 flex-1"
        >
          <LogOut className="h-5 w-5 text-[#00B6CB]" />
          <span className="text-xs mt-1 text-gray-600">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
