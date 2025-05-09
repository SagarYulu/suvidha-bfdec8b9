
import React from "react";
import { Home, FilePlus, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath.includes(path);
  };

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full z-50 mobile-safe-bottom shadow-lg"
         style={{ height: 'var(--mobile-footer-height)' }}>
      <div className="flex justify-around h-full">
        <NavButton 
          label="Home"
          icon={<Home className="h-5 w-5" />}
          isActive={isActive("/mobile/issues") && !isActive("/mobile/issues/new")}
          onClick={onHomeClick}
        />
        
        <NavButton 
          label="New Ticket"
          icon={<FilePlus className="h-5 w-5" />}
          isActive={isActive("/mobile/issues/new")}
          onClick={onNewIssueClick}
        />
        
        <NavButton 
          label="Logout"
          icon={<LogOut className="h-5 w-5" />}
          isActive={false}
          onClick={onLogoutClick}
        />
      </div>
    </nav>
  );
};

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full",
        isActive 
          ? "text-yulu-blue" 
          : "text-gray-500 active:bg-gray-100"
      )}
    >
      <div className={cn(
        "flex items-center justify-center",
        isActive && "animate-pulse"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-xs mt-1",
        isActive && "font-semibold"
      )}>
        {label}
      </span>
    </button>
  );
};

export default MobileBottomNav;
