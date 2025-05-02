
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
    
    // Explicitly defined dashboard user emails that should never access mobile app
    const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
    
    // Dashboard user roles that should be redirected to admin dashboard
    const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
    
    // Check if email is in restricted list
    if (authState.user?.email && restrictedEmails.includes(authState.user.email)) {
      console.log("Restricted email detected in MobileLayout:", authState.user.email);
      toast({
        title: "Access Denied",
        description: "You don't have access to the mobile app. Please use the admin dashboard.",
        variant: "destructive"
      });
      logout();
      navigate("/admin/login", { replace: true });
      return;
    }
    
    // Check if user has a dashboard role
    if (authState.role && dashboardUserRoles.includes(authState.role)) {
      console.log("Dashboard role detected in MobileLayout:", authState.role);
      toast({
        title: "Access Denied",
        description: "You don't have access to the mobile app. Please use the admin dashboard.",
        variant: "destructive"
      });
      logout();
      navigate("/admin/login", { replace: true });
      return;
    }
    
    console.log("Employee authenticated in mobile app:", authState.user);
  }, [authState, navigate, checkAccess, logout]);

  const handleLogout = () => {
    logout();
    navigate("/mobile/login", { replace: true });
  };

  // Show loading state while checking authorization
  if (!authState.isAuthenticated) {
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
