
import React from 'react';
import RoleBasedGuard from './RoleBasedGuard';
import { Permission } from '@/contexts/RBACContext';
import PermissionGate from '../rbac/PermissionGate';

// Base interface for all permission guards
interface GuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Dashboard access guard
export const DashboardGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/' 
}) => (
  <RoleBasedGuard permission="view:dashboard" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// User management guard
export const UserManagementGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:users" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Issues management guard
export const IssuesGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:issues" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Analytics access guard
export const AnalyticsGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:analytics" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Settings access guard
export const SettingsGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:settings" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Security access guard
export const SecurityGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="access:security" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Create dashboard user guard
export const CreateDashboardUserGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="create:dashboardUser" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Update the mobile issue component to handle the case correctly
<lov-write file_path="src/components/mobile/issues/ClosedIssueCommentNotice.tsx">
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ClosedIssueCommentNoticeProps {
  isReopenable: boolean;
  onReopen: (issueId: string) => void;
  issueId: string;
  employeeUuid: string;
}

const ClosedIssueCommentNotice: React.FC<ClosedIssueCommentNoticeProps> = ({
  isReopenable,
  onReopen,
  issueId
}) => {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm text-gray-700">
          <p>This ticket is closed. You cannot add new comments.</p>
          <p className="text-gray-500 mt-1 text-xs">यह टिकट बंद है। आप नई टिप्पणियां नहीं जोड़ सकते।</p>
        </div>

        {isReopenable && (
          <Button
            onClick={() => onReopen(issueId)}
            className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Clock className="h-4 w-4" />
            <span>Reopen Ticket / टिकट फिर से खोलें</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClosedIssueCommentNotice;
