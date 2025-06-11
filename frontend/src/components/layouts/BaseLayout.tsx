
import React from 'react';

interface BaseLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, header, sidebar, className }) => {
  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      {header}
      <div className="flex">
        {sidebar}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
