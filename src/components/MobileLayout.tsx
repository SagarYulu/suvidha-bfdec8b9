
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import BaseLayout from "./layouts/BaseLayout";
import MobileHeader from "./layouts/headers/MobileHeader";
import MobileBottomNav from "./layouts/navigation/MobileBottomNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  className 
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authState.isAuthenticated) {
      console.log("Not authenticated, redirecting to mobile login");
      navigate("/mobile/login");
      return;
    }
    
    // If user is admin, redirect to admin dashboard
    if (authState.role === "admin") {
      console.log("Admin detected in mobile app, redirecting to admin dashboard");
      toast({
        title: "Admin Access Detected",
        description: "Redirecting to admin dashboard",
      });
      navigate("/admin/dashboard");
      return;
    }

    console.log("Employee authenticated in mobile app", authState.user);
  }, [authState, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/mobile/login");
  };

  const header = (
    <MobileHeader
      title={title}
      userName={authState.user?.name}
    />
  );

  const footer = (
    <MobileBottomNav
      onHomeClick={() => navigate("/mobile/issues")}
      onNewIssueClick={() => navigate("/mobile/issues/new")}
      onLogoutClick={handleLogout}
    />
  );

  return (
    <BaseLayout 
      header={header} 
      footer={footer}
      className={className}
      contentClassName="pb-16" // Add bottom padding for mobile navigation
    >
      {children}
    </BaseLayout>
  );
};

export default MobileLayout;
