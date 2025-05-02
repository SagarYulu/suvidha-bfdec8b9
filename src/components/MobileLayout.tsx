
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useRoleAccess } from "@/hooks/useRoleAccess";
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
  const { checkAccess } = useRoleAccess();

  useEffect(() => {
    // Check if user is authenticated for mobile access
    if (!authState.isAuthenticated) {
      console.log("Not authenticated, redirecting to mobile login");
      navigate("/mobile/login", { replace: true });
      return;
    }
    
    // List of admin roles that should be redirected
    const adminRoles = ["admin", "security-admin", "Super Admin"];
    
    // If user is admin, redirect to admin dashboard
    if (adminRoles.includes(authState.role || "")) {
      console.log("Admin detected in mobile app, redirecting to admin dashboard");
      toast({
        title: "Admin Access Detected",
        description: "Redirecting to admin dashboard",
      });
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    console.log("Employee authenticated in mobile app", authState.user);
  }, [authState, navigate, checkAccess]);

  const handleLogout = () => {
    logout();
    navigate("/mobile/login", { replace: true });
  };

  // Show loading state while checking authorization
  if (!authState.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      onHomeClick={() => navigate("/dashboard")} // Changed to redirect to dashboard
      onNewIssueClick={() => navigate("/dashboard")} // Changed to redirect to dashboard
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
