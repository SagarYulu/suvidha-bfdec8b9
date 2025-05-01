
import React from "react";
import { Toaster } from "@/components/ui/toaster";

interface BaseLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  header,
  footer,
  sidebar,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {sidebar && (
        <aside className="h-screen">
          {sidebar}
        </aside>
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {header && <header>{header}</header>}
        
        <main className={`flex-grow ${!sidebar ? "p-4" : "p-6"}`}>
          {children}
        </main>
        
        {footer && <footer>{footer}</footer>}
      </div>
      <Toaster />
    </div>
  );
};

export default BaseLayout;
