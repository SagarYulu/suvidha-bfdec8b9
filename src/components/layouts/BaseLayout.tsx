
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { useMobileCheck } from "@/hooks/use-mobile";

interface BaseLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  header,
  footer,
  sidebar,
  className,
  contentClassName,
}) => {
  // Determine if we have a sidebar to adjust layout
  const hasSidebar = Boolean(sidebar);
  const isMobile = useMobileCheck();
  
  // For mobile layouts, add top padding to account for fixed header
  const mobileContentStyle = isMobile && header 
    ? { paddingTop: 'var(--mobile-header-height)' } 
    : {};

  return (
    <div className={cn("flex min-h-screen bg-gray-100", className)}>
      {sidebar && (
        <aside className="h-screen">
          {sidebar}
        </aside>
      )}
      
      <div className={cn(
        "flex flex-col flex-1 overflow-hidden", 
        contentClassName
      )}>
        {header && <header className="w-full">{header}</header>}
        
        <main 
          className={cn(
            "flex-grow", 
            !hasSidebar && !isMobile ? "p-4" : "", 
            isMobile ? "overflow-auto" : ""
          )}
          style={mobileContentStyle}
        >
          {children}
        </main>
        
        {footer && <footer className="w-full">{footer}</footer>}
      </div>
      <Toaster />
    </div>
  );
};

export default BaseLayout;
