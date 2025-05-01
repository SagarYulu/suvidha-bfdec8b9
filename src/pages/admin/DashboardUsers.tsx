
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardRole, DashboardUser, getDashboardUsers } from "@/services/dashboardRoleService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { Plus, UserPlus } from "lucide-react";
import BulkUserUpload from "@/components/BulkUserUpload";

// Import refactored components
import SearchBar from "@/components/dashboard-users/SearchBar";
import UsersTable from "@/components/dashboard-users/UsersTable";
import SpreadsheetMode from "@/components/dashboard-users/SpreadsheetMode";
import AddUserForm from "@/components/dashboard-users/AddUserForm";

const DashboardUsers = () => {
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DashboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSpreadsheetMode, setIsSpreadsheetMode] = useState(false);
  const { authState } = useAuth();

  // Fetch dashboard users
  const fetchDashboardUsers = async () => {
    setIsLoading(true);
    try {
      const users = await getDashboardUsers();
      setDashboardUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error("Error fetching dashboard users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardUsers();
  }, []);

  // Filter users when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = dashboardUsers.filter(
        user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(dashboardUsers);
    }
  }, [searchTerm, dashboardUsers]);

  // Toggle spreadsheet mode
  const toggleSpreadsheetMode = () => {
    setIsSpreadsheetMode(prev => !prev);
  };

  return (
    <RoleProtectedRoute page="dashboard_users" action="view">
      <AdminLayout title="Dashboard Users Management" requiredPage="dashboard_users">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            <div className="flex gap-3">
              {isSpreadsheetMode ? (
                <SpreadsheetMode 
                  onCancel={toggleSpreadsheetMode}
                  onSuccess={() => {
                    toggleSpreadsheetMode();
                    fetchDashboardUsers();
                  }}
                />
              ) : (
                <>
                  <Button 
                    onClick={toggleSpreadsheetMode}
                    variant="outline" 
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Multiple Users
                  </Button>
                  
                  {authState.role === DashboardRole.ADMIN && (
                    <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-yulu-blue hover:bg-blue-700">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Single User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Dashboard User</DialogTitle>
                          <DialogDescription>
                            Create a new user with access to Yulu Suvidha dashboard.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <AddUserForm 
                          onSuccess={() => {
                            setIsAddUserDialogOpen(false);
                            fetchDashboardUsers();
                          }}
                          onCancel={() => setIsAddUserDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
          </div>
          
          {isSpreadsheetMode ? (
            null // SpreadsheetMode is rendered above when isSpreadsheetMode is true
          ) : (
            <>
              <UsersTable 
                users={filteredUsers}
                isLoading={isLoading}
                onRoleChange={fetchDashboardUsers}
                currentUserRole={authState.role}
              />
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Bulk Upload</h3>
                <BulkUserUpload onUploadSuccess={fetchDashboardUsers} />
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </RoleProtectedRoute>
  );
};

export default DashboardUsers;
