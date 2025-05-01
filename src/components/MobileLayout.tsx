
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Set a short timeout to ensure auth state is loaded
    const checkAuth = setTimeout(() => {
      // Redirect if not authenticated
      if (!authState.isAuthenticated) {
        console.log("Not authenticated, redirecting to mobile login");
        navigate("/mobile/login", { replace: true });
        return;
      }
      
      // If user is admin, redirect to admin dashboard
      if (authState.role === "admin" || authState.role === "security-admin") {
        console.log("Admin detected in mobile app, redirecting to admin dashboard");
        toast({
          title: "Admin Access Detected",
          description: "Redirecting to admin dashboard",
        });
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      console.log("Employee authenticated in mobile app", authState.user);
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [authState, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/mobile/login", { replace: true });
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

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
