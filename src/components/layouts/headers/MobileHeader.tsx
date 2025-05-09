
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  userName?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  hideBackButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  userName, 
  className,
  bgColor = "bg-yulu-blue",
  textColor = "text-white",
  hideBackButton = false,
  onBack,
  children
}) => {
  return (
    <div 
      className={cn(
        `${bgColor} ${textColor} px-4 py-3 shadow-sm fixed w-full top-0 z-50 mobile-safe-top`,
        className
      )} 
      style={{ height: 'var(--mobile-header-height)' }}
    >
      <div className="flex items-center h-full">
        {!hideBackButton && (
          <button 
            onClick={onBack} 
            className="mr-3 p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {userName && <p className="text-xs opacity-80 -mt-0.5 truncate">Hello, {userName}</p>}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default MobileHeader;
