
import { ReactNode } from "react";
import MobileHeader from "./layouts/headers/MobileHeader";
import MobileBottomNav from "./layouts/navigation/MobileBottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  bgColor?: string;
  showBottomNav?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const MobileLayout = ({ 
  children, 
  title = "Yulu Suvidha", 
  bgColor = "bg-green-600",
  showBottomNav = true,
  showBackButton = false,
  onBackClick
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title={title} 
        bgColor={bgColor}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
      />
      <main className={showBottomNav ? "pb-16" : ""}>
        {children}
      </main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};

export default MobileLayout;
