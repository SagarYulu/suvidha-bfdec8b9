
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { getDashboardUsers, assignDashboardRole, DashboardRole, DashboardUser } from "@/services/dashboardRoleService";
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
import { Input } from "@/components/ui/input";
import { Shield, ShieldCheck, ShieldX, AlertTriangle, Search } from "lucide-react";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

const AccessControl = () => {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DashboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [actionType, setActionType] = useState<"grant" | "revoke">("grant");
  const { authState } = useAuth();
  const navigate = useNavigate();

  // Load dashboard users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const dashboardUsers = await getDashboardUsers();
      setUsers(dashboardUsers);
      setFilteredUsers(dashboardUsers);
      
      // Check each user for admin role
      const adminIds = new Set<string>();
      for (const user of dashboardUsers) {
        if (user.role === DashboardRole.ADMIN) {
          adminIds.add(user.id);
        }
      }
      setAdminUserIds(adminIds);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    if (authState.role !== DashboardRole.ADMIN && authState.role !== DashboardRole.SECURITY_MANAGER) {
      toast({
        title: "Access Denied",
        description: "You do not have sufficient privileges",
        variant: "destructive",
      });
      navigate("/admin/dashboard");
      return;
    }

    loadUsers();
  }, [authState, navigate]);

  // Filter users when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleGrantAdmin = (user: DashboardUser) => {
    setSelectedUser(user);
    setActionType("grant");
    setDialogOpen(true);
  };

  const handleRevokeAdmin = (user: DashboardUser) => {
    setSelectedUser(user);
    setActionType("revoke");
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      let success = false;
      
      if (actionType === "grant") {
        success = await assignDashboardRole(selectedUser.id, DashboardRole.ADMIN);
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

        success = await assignDashboardRole(selectedUser.id, DashboardRole.OPS_HEAD);
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

      if (success) {
        loadUsers(); // Reload the user list to reflect changes
      } else {
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
    <RoleProtectedRoute page="access_control" action="view">
      <AdminLayout title="Access Control">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Admin Access Management</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => loadUsers()} variant="outline">
                Refresh
              </Button>
            </div>
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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.emp_id}</TableCell>
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
                        No dashboard users found
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
                    : `Are you sure you want to revoke admin access from ${selectedUser?.name}? They will no longer have admin privileges.`}
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
    </RoleProtectedRoute>
  );
};

export default AccessControl;
