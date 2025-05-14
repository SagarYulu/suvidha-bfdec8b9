
import React from "react";
import { Home, FilePlus, LogOut, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MobileBottomNavProps {
  onHomeClick: () => void;
  onNewIssueClick: () => void;
  onSentimentClick: () => void;
  onLogoutClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onHomeClick,
  onNewIssueClick,
  onSentimentClick,
  onLogoutClick,
}) => {
  const location = useLocation();

  return (
    <nav className="bg-white border-t fixed bottom-0 w-full">
      <div className="flex justify-around items-center">
        <div className="flex-1 flex justify-center">
          <button 
            onClick={onHomeClick}
            className={cn(
              "flex flex-col items-center py-3",
              location.pathname === "/mobile/issues" && "text-blue-500"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
        </div>
        
        <div className="flex justify-center -mt-5">
          <button
            onClick={onNewIssueClick}
            className="bg-[#00CEDE] text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md"
          >
            <FilePlus className="h-6 w-6" />
            <span className="text-xs mt-1">Raise ticket</span>
          </button>
        </div>
        
        <div className="flex-1 flex justify-center">
          <button 
            onClick={onSentimentClick}
            className={cn(
              "flex flex-col items-center py-3",
              location.pathname === "/mobile/sentiment" && "text-blue-500"
            )}
          >
            <Smile className="h-5 w-5" />
            <span className="text-xs mt-1">Feedback</span>
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
