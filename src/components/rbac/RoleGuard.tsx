
import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Permission } from '@/contexts/RBACContext';

interface RoleGuardProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  permission, 
  fallback = null, 
  children 
}) => {
  const { hasPermission } = useRBAC();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
