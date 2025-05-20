
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TicketAccessGuardProps {
  children: React.ReactNode;
  onlyForAssigned?: boolean;
  redirectTo?: string;
}

/**
 * A component that guards routes based on ticket access permissions
 */
const TicketAccessGuard: React.FC<TicketAccessGuardProps> = ({
  children,
  onlyForAssigned = false,
  redirectTo = '/admin/dashboard'
}) => {
  const { checkAccess, hasPermission, isAuthenticated } = useRoleAccess();
  const { authState } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Only check access once authentication state is known
    if (isAuthenticated !== undefined) {
      // First, check if user has the basic issue management permission
      const hasIssuePermission = checkAccess('manage:issues', { 
        redirectTo, 
        showToast: false 
      });

      let hasTicketAccess = false;
      
      if (hasIssuePermission) {
        // For "Assigned to Me" section - allow access to all users with issue management permission
        if (onlyForAssigned) {
          hasTicketAccess = true;
          console.log("Access granted to assigned tickets for user with issue management permission");
        } else {
          // For "All Tickets" section - only specific roles can access
          // HR Admin, Super Admin, and Payroll Ops can view all tickets
          const hasAllTicketsAccess = 
            authState.role === 'HR Admin' || 
            authState.role === 'Super Admin' || 
            authState.role === 'admin' ||
            authState.role === 'Payroll Ops';
          
          if (hasAllTicketsAccess) {
            console.log(`Role ${authState.role} granted access to all tickets`);
            hasTicketAccess = true;
          } else {
            console.log(`Role ${authState.role} denied access to all tickets - can only see assigned tickets`);
            toast({
              title: "Access Restricted",
              description: "You can only view tickets assigned to you",
              variant: "destructive"
            });
          }
        }
      } else {
        console.log("User does not have basic issue management permission");
      }
      
      setHasAccess(hasTicketAccess);
      setAccessChecked(true);
    }
  }, [isAuthenticated, authState.role, authState.user, checkAccess, onlyForAssigned, redirectTo]);

  // Show loading indicator while checking access
  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  // If no access, redirect
  if (!hasAccess) {
    console.log(`Access denied, redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  // If has access, render children
  console.log("Access granted, rendering protected content");
  return <>{children}</>;
};

export default TicketAccessGuard;
