
import React from 'react';
import MobileHeader from '@/components/layouts/headers/MobileHeader';
import MobileBottomNav from '@/components/layouts/navigation/MobileBottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileHeader title={title} />
      <main className="flex-1 pb-16">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default MobileLayout;
