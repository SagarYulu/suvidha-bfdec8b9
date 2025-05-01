
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getUsers } from "@/services/userService";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";

const AccessControl = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"grant" | "revoke">("grant");
  const { authState, checkUserRole, assignRole, removeRole } = useAuth();
  const navigate = useNavigate();

  // Check if current user is admin
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    if (authState.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadUsers();
  }, [authState, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersList = await getUsers();
      setUsers(usersList);

      // Check each user for admin role
      const adminIds = new Set<string>();
      for (const user of usersList) {
        if (user.role === "admin") {
          adminIds.add(user.id);
        } else {
          const isAdmin = await checkUserRole(user.id, "admin");
          if (isAdmin) {
            adminIds.add(user.id);
          }
        }
      }
      setAdminUserIds(adminIds);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAdmin = (user: User) => {
    setSelectedUser(user);
    setActionType("grant");
    setDialogOpen(true);
  };

  const handleRevokeAdmin = (user: User) => {
    setSelectedUser(user);
    setActionType("revoke");
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      let success = false;
      
      if (actionType === "grant") {
        success = await assignRole(selectedUser.id, "admin");
        if (success) {
          setAdminUserIds(prev => new Set(prev).add(selectedUser.id));
          toast({
            title: "Success",
            description: `Admin access granted to ${selectedUser.name}`,
          });
        }
      } else {
        // Don't allow revoking admin from default admin
        if (selectedUser.email === "admin@yulu.com") {
          toast({
            title: "Cannot Revoke",
            description: "Default admin access cannot be revoked",
            variant: "destructive",
          });
          setDialogOpen(false);
          return;
        }

        success = await removeRole(selectedUser.id, "admin");
        if (success) {
          setAdminUserIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedUser.id);
            return newSet;
          });
          toast({
            title: "Success",
            description: `Admin access revoked from ${selectedUser.name}`,
          });
        }
      }

      if (!success) {
        toast({
          title: "Error",
          description: `Failed to ${actionType === "grant" ? "grant" : "revoke"} admin access`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDialogOpen(false);
    }
  };

  return (
    <AdminLayout title="Access Control">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Access Management</h2>
          <Button onClick={() => loadUsers()} variant="outline">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Admin Access</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.employeeId}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {adminUserIds.has(user.id) ? (
                          <div className="flex items-center text-green-600">
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            <span>Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <ShieldX className="w-4 h-4 mr-1" />
                            <span>No</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {adminUserIds.has(user.id) ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeAdmin(user)}
                            disabled={user.email === "admin@yulu.com"} // Prevent revoking default admin
                          >
                            Revoke Admin
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGrantAdmin(user)}
                          >
                            Grant Admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "grant" ? "Grant Admin Access" : "Revoke Admin Access"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "grant"
                  ? `Are you sure you want to grant admin access to ${selectedUser?.name}? They will have full access to the admin dashboard and all its features.`
                  : `Are you sure you want to revoke admin access from ${selectedUser?.name}? They will no longer be able to access the admin dashboard.`}
              </DialogDescription>
            </DialogHeader>
            
            {actionType === "grant" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This will give the user complete access to the admin dashboard,
                      including the ability to manage other users.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "grant" ? "default" : "destructive"}
                onClick={handleConfirmAction}
              >
                {actionType === "grant" ? "Grant Access" : "Revoke Access"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AccessControl;
