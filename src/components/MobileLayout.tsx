
import React from 'react';
import MobileHeader from './layouts/headers/MobileHeader';
import MobileBottomNav from './layouts/navigation/MobileBottomNav';
import { Toaster } from '@/components/ui/toaster';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
  onMenuClick?: () => void;
  bgColor?: string; // Add bgColor prop
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showHeader = true,
  showBottomNav = true,
  onMenuClick,
  bgColor = "bg-gray-50" // Default background color
}) => {
  return (
    <div className={`min-h-screen ${bgColor} flex flex-col`}>
      {showHeader && (
        <MobileHeader 
          title={title} 
          onMenuClick={onMenuClick}
        />
      )}
      
      <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && <MobileBottomNav />}
      <Toaster />
    </div>
  );
};

export default MobileLayout;
