
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import BaseLayout from "./layouts/BaseLayout";
import MobileHeader from "./layouts/headers/MobileHeader";
import MobileBottomNav from "./layouts/navigation/MobileBottomNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  bgColor?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  className,
  bgColor = "bg-yulu-dashboard-blue" // Updated to use dashboard blue color
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const { checkAccess } = useRoleAccess();
  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const accessCheckPerformed = useRef(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Force loading to stop after 5 seconds even if checks are still running
  // This prevents users from getting stuck on the loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Skip if we've already performed the check in this component instance
    if (accessCheckPerformed.current) {
      return;
    }
    
    accessCheckPerformed.current = true;
    
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
      
      // Regular employees are allowed through
      console.log("User authorized for mobile app access:", authState.user);
      setIsAccessChecked(true);
    };
    
    // Add short delay to checkUserAccess to avoid race conditions
    const timer = setTimeout(() => {
      checkUserAccess();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [authState, navigate, checkAccess, logout]);

  const handleLogout = () => {
    logout();
    navigate("/mobile/login", { replace: true });
  };

  // Show loading state while checking authorization, but don't get stuck forever
  // Either we've checked access, or the timeout has occurred
  if ((!authState.isAuthenticated || !isAccessChecked) && !loadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-dashboard-blue mb-4"></div>
        <p className="text-sm text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  const header = (
    <MobileHeader
      title={title}
      userName={authState.user?.name}
      bgColor={bgColor}
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
