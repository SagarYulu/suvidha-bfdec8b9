
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import MobileHeader from "./layouts/headers/MobileHeader";
import MobileBottomNav from "./layouts/navigation/MobileBottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  bgColor?: string;
  showBottomNav?: boolean;
}

const MobileLayout = ({ 
  children, 
  title = "Yulu Suvidha", 
  bgColor = "bg-blue-600",
  showBottomNav = true 
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title={title} bgColor={bgColor} />
      <main className="pb-16">
        {children}
      </main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};

export default MobileLayout;
