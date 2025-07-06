
import React, { ReactNode } from 'react';
import { useRBAC } from '@/contexts/RBACContext';

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = useRBAC();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
