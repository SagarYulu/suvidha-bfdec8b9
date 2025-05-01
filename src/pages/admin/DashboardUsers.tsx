
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
import { Plus, UserPlus, Filter } from "lucide-react";
import BulkUserUpload from "@/components/BulkUserUpload";

// Import refactored components
import SearchBar from "@/components/dashboard-users/SearchBar";
import UsersTable from "@/components/dashboard-users/UsersTable";
import SpreadsheetMode from "@/components/dashboard-users/SpreadsheetMode";
import AddUserForm from "@/components/dashboard-users/AddUserForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";

const DashboardUsers = () => {
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DashboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [filterCluster, setFilterCluster] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSpreadsheetMode, setIsSpreadsheetMode] = useState(false);
  const [availableClusters, setAvailableClusters] = useState<string[]>([]);
  const { authState } = useAuth();

  // Update available clusters when filter city changes
  useEffect(() => {
    if (filterCity && CLUSTER_OPTIONS[filterCity]) {
      setAvailableClusters(CLUSTER_OPTIONS[filterCity]);
      if (filterCluster && !CLUSTER_OPTIONS[filterCity].includes(filterCluster)) {
        setFilterCluster(null);
      }
    } else {
      setAvailableClusters([]);
      setFilterCluster(null);
    }
  }, [filterCity, filterCluster]);

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

  // Filter users when searchTerm, filterCity, or filterCluster changes
  useEffect(() => {
    let filtered = [...dashboardUsers];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.emp_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply city filter
    if (filterCity) {
      filtered = filtered.filter(user => user.city?.toLowerCase() === filterCity.toLowerCase());
    }
    
    // Apply cluster filter
    if (filterCluster) {
      filtered = filtered.filter(user => user.cluster?.toLowerCase() === filterCluster.toLowerCase());
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, filterCity, filterCluster, dashboardUsers]);

  // Toggle spreadsheet mode
  const toggleSpreadsheetMode = () => {
    setIsSpreadsheetMode(prev => !prev);
  };

  return (
    <RoleProtectedRoute page="dashboard_users" action="view">
      <AdminLayout title="Dashboard Users Management" requiredPage="dashboard_users">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium hidden sm:inline">Filters:</span>
                
                <Select value={filterCity || ''} onValueChange={(value) => setFilterCity(value || null)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {CITY_OPTIONS.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filterCluster || ''} 
                  onValueChange={(value) => setFilterCluster(value || null)}
                  disabled={!filterCity || availableClusters.length === 0}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={!filterCity ? "Select city first" : "Cluster"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Clusters</SelectItem>
                    {availableClusters.map(cluster => (
                      <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-3">
              {isSpreadsheetMode ? (
                null // No buttons shown in spreadsheet mode
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
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
            <SpreadsheetMode 
              onCancel={toggleSpreadsheetMode}
              onSuccess={() => {
                toggleSpreadsheetMode();
                fetchDashboardUsers();
              }}
            />
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
