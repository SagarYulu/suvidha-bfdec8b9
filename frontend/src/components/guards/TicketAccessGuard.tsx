
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface TicketAccessGuardProps {
  children: React.ReactNode;
  ticketOwnerId: string;
  currentUserId: string;
  userRole: string;
  fallback?: React.ReactNode;
}

const TicketAccessGuard: React.FC<TicketAccessGuardProps> = ({
  children,
  ticketOwnerId,
  currentUserId,
  userRole,
  fallback
}) => {
  // Admin and agents can access all tickets
  // Regular users can only access their own tickets
  const hasAccess = 
    userRole === 'admin' || 
    userRole === 'agent' || 
    ticketOwnerId === currentUserId;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this ticket.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default TicketAccessGuard;
