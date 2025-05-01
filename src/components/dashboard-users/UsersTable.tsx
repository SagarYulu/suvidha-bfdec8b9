
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { DashboardRole, DashboardUser, assignDashboardRole } from "@/services/dashboardRoleService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersTableProps {
  users: DashboardUser[];
  isLoading: boolean;
  onRoleChange: () => void;
  currentUserRole: DashboardRole | string | null;
}

const UsersTable = ({ users, isLoading, onRoleChange, currentUserRole }: UsersTableProps) => {
  const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: DashboardRole) => {
    try {
      setUpdatingRoleFor(userId);
      const success = await assignDashboardRole(userId, newRole);
      
      if (success) {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        onRoleChange();
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingRoleFor(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Employee ID</TableHead>
            {currentUserRole === DashboardRole.ADMIN && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === DashboardRole.ADMIN 
                      ? "bg-blue-100 text-blue-800" 
                      : user.role === DashboardRole.SECURITY_MANAGER
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>{user.emp_id}</TableCell>
                {currentUserRole === DashboardRole.ADMIN && (
                  <TableCell>
                    <Select
                      value={user.role}
                      disabled={updatingRoleFor === user.id}
                      onValueChange={(value) => handleRoleChange(user.id, value as DashboardRole)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Change role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={DashboardRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={DashboardRole.OPS_HEAD}>Ops Head</SelectItem>
                        <SelectItem value={DashboardRole.SECURITY_MANAGER}>Security Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={currentUserRole === DashboardRole.ADMIN ? 5 : 4} className="text-center py-6">
                No dashboard users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
