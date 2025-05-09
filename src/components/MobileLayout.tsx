
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useIsMobile } from "@/hooks/use-mobile";
import BaseLayout from "./layouts/BaseLayout";
import MobileHeader from "./layouts/headers/MobileHeader";
import MobileBottomNav from "./layouts/navigation/MobileBottomNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  hideBackButton?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  className,
  hideBackButton
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const { checkAccess } = useRoleAccess();
  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkUserAccess = async () => {
      console.log("Checking user access in MobileLayout");
      
      // Check if user is authenticated for mobile access
      if (!authState.isAuthenticated) {
        console.log("Not authenticated, redirecting to mobile login");
        navigate("/mobile/login", { replace: true });
        return;
      }
      
      // Explicitly defined dashboard user emails that should never access mobile app
      const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
      
      // Dashboard user roles that should be redirected to admin dashboard
      const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
      
      const userEmail = authState.user?.email || '';
      const userRole = authState.role || '';
      
      console.log("User access check: email =", userEmail, "role =", userRole);
      
      // Check if email is in restricted list
      if (restrictedEmails.includes(userEmail)) {
        console.log("Restricted email detected in MobileLayout:", userEmail);
        toast({
          title: "Access Denied",
          description: "You don't have access to the mobile app. Please use the admin dashboard.",
          variant: "destructive"
        });
        await logout();
        navigate("/admin/login", { replace: true });
        return;
      }
      
      // Check if user has a dashboard role
      if (dashboardUserRoles.includes(userRole)) {
        console.log("Dashboard role detected in MobileLayout:", userRole);
        toast({
          title: "Access Denied",
          description: "You don't have access to the mobile app. Please use the admin dashboard.",
          variant: "destructive"
        });
        await logout();
        navigate("/admin/login", { replace: true });
        return;
      }
      
      // Regular employees are allowed through - add a debug message confirming this
      console.log("User authorized for mobile app access:", authState.user);
      setIsAccessChecked(true);
    };
    
    checkUserAccess();
  }, [authState, navigate, checkAccess, logout]);

  const handleLogout = () => {
    logout();
    navigate("/mobile/login", { replace: true });
  };

  // Show loading state while checking authorization
  if (!authState.isAuthenticated || !isAccessChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--mobile-background))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  const header = (
    <MobileHeader
      title={title}
      userName={authState.user?.name}
      hideBackButton={hideBackButton}
      onBack={() => navigate(-1)}
    />
  );

  const footer = (
    <MobileBottomNav
      onHomeClick={() => navigate("/mobile/issues")}
      onNewIssueClick={() => navigate("/mobile/issues/new")}
      onLogoutClick={handleLogout}
    />
  );

  // Mobile app layout with improved styling
  return (
    <BaseLayout 
      header={header} 
      footer={footer}
      className={`mobile-container ${className || ""}`}
      contentClassName="pb-[var(--mobile-footer-height)]"
    >
      <div className="px-4 pt-2">
        {children}
      </div>
    </BaseLayout>
  );
};

export default MobileLayout;
