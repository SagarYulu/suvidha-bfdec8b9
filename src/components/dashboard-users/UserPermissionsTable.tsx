
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employee_id: string | null;
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface UserPermissionsTableProps {
  dashboardUsers: DashboardUser[];
  permissions: Permission[];
  isLoading: boolean;
  hasPermission: (userId: string, permissionId: string) => boolean;
  togglePermission: (userId: string, permissionId: string) => Promise<void>;
}

const UserPermissionsTable: React.FC<UserPermissionsTableProps> = ({
  dashboardUsers,
  permissions,
  isLoading,
  hasPermission,
  togglePermission,
}) => {
  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (dashboardUsers.length === 0) {
    return <div className="text-center py-10">No dashboard users found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            {permissions.map(permission => (
              <TableHead key={permission.id}>
                {permission.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dashboardUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              {permissions.map(permission => (
                <TableCell key={`${user.id}-${permission.id}`}>
                  <Checkbox 
                    checked={hasPermission(user.id, permission.id)}
                    onCheckedChange={() => togglePermission(user.id, permission.id)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserPermissionsTable;
