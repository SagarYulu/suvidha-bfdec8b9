
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { DashboardRole, createBulkDashboardUsers } from "@/services/dashboardRoleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";
import { Plus, Trash, Check, X, Filter, Search } from "lucide-react";

// Type for our spreadsheet rows
interface SpreadsheetRow {
  id: string;
  name: string;
  email: string;
  empId: string;
  city: string;
  cluster: string;
  manager: string;
  role: DashboardRole;
  phone?: string;
  isNew?: boolean;
  isValid?: boolean;
}

interface SpreadsheetModeProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const SpreadsheetMode = ({ onCancel, onSuccess }: SpreadsheetModeProps) => {
  const [spreadsheetRows, setSpreadsheetRows] = useState<SpreadsheetRow[]>([{
    id: `row-${Date.now()}`,
    name: "",
    email: "",
    empId: "",
    city: "",
    cluster: "",
    manager: "",
    role: DashboardRole.OPS_HEAD,
    phone: "",
    isNew: true
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [filterCluster, setFilterCluster] = useState<string | null>(null);
  const [availableClusters, setAvailableClusters] = useState<string[]>([]);

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

  // Add a new empty row to the spreadsheet
  const addSpreadsheetRow = () => {
    setSpreadsheetRows(prev => [
      ...prev, 
      {
        id: `row-${Date.now()}`,
        name: "",
        email: "",
        empId: "",
        city: filterCity || "",
        cluster: filterCluster || "",
        manager: "",
        role: DashboardRole.OPS_HEAD,
        phone: "",
        isNew: true
      }
    ]);
  };

  // Handle changes to a spreadsheet row
  const handleSpreadsheetRowChange = (
    id: string, 
    field: keyof SpreadsheetRow, 
    value: string | DashboardRole
  ) => {
    setSpreadsheetRows(prev => 
      prev.map(row => {
        if (row.id !== id) return row;
        
        // If changing city, reset cluster if not valid for the new city
        if (field === 'city' && typeof value === 'string') {
          const newCity = value;
          const validClusters = newCity && CLUSTER_OPTIONS[newCity] ? CLUSTER_OPTIONS[newCity] : [];
          if (!validClusters.includes(row.cluster)) {
            return {
              ...row,
              [field]: value,
              cluster: '' // Reset cluster
            };
          }
        }
        
        return { ...row, [field]: value };
      })
    );
  };

  // Remove a row from the spreadsheet
  const removeSpreadsheetRow = (id: string) => {
    setSpreadsheetRows(prev => prev.filter(row => row.id !== id));
  };

  // Email validation helper
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Filter rows based on search and filters
  const filteredRows = spreadsheetRows.filter(row => {
    let matches = true;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matches = matches && (
        row.name.toLowerCase().includes(searchLower) ||
        row.email.toLowerCase().includes(searchLower) ||
        row.empId.toLowerCase().includes(searchLower) ||
        row.manager.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterCity) {
      matches = matches && row.city === filterCity;
    }
    
    if (filterCluster) {
      matches = matches && row.cluster === filterCluster;
    }
    
    return matches;
  });

  // Validate all rows in the spreadsheet
  const validateSpreadsheetRows = () => {
    return setSpreadsheetRows(prev => 
      prev.map(row => ({
        ...row,
        isValid: !!row.name && !!row.email && !!row.empId && !!row.city && 
                 !!row.cluster && !!row.manager && !!row.role && validateEmail(row.email)
      }))
    );
  };

  // Save all valid rows from the spreadsheet
  const saveSpreadsheetRows = async () => {
    validateSpreadsheetRows();
    
    // Filter out valid rows
    const validRows = spreadsheetRows.filter(row => 
      row.name && row.email && row.empId && row.city && row.cluster && 
      row.manager && row.role && validateEmail(row.email)
    );
    
    if (validRows.length === 0) {
      toast({
        title: "Validation Error",
        description: "No valid rows to save. Please check your entries.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await createBulkDashboardUsers(validRows.map(row => ({
        name: row.name,
        email: row.email,
        emp_id: row.empId,
        city: row.city,
        cluster: row.cluster,
        manager: row.manager,
        role: row.role,
        phone: row.phone || null,
        password: 'changeme123' // Default password
      })));
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Added ${result.count} new dashboard users`,
        });
        
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: "Failed to add dashboard users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding dashboard users:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get available clusters for a specific row
  const getAvailableClustersForRow = (city: string) => {
    return city && CLUSTER_OPTIONS[city] ? CLUSTER_OPTIONS[city] : [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
            
            <Select value={filterCity || ''} onValueChange={(value) => setFilterCity(value || null)}>
              <SelectTrigger className="w-[120px]">
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
              <SelectTrigger className="w-[140px]">
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
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Cluster</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row, index) => (
              <TableRow key={row.id} className={row.isValid === false ? "bg-red-50" : undefined}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Input
                    value={row.name}
                    onChange={(e) => handleSpreadsheetRowChange(row.id, 'name', e.target.value)}
                    placeholder="Full Name"
                    className={row.isValid === false && !row.name ? "border-red-500" : ""}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.email}
                    onChange={(e) => handleSpreadsheetRowChange(row.id, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className={row.isValid === false && (!row.email || !validateEmail(row.email)) ? "border-red-500" : ""}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.empId}
                    onChange={(e) => handleSpreadsheetRowChange(row.id, 'empId', e.target.value)}
                    placeholder="Employee ID"
                    className={row.isValid === false && !row.empId ? "border-red-500" : ""}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.city}
                    onValueChange={(value) => handleSpreadsheetRowChange(row.id, 'city', value)}
                  >
                    <SelectTrigger className={row.isValid === false && !row.city ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITY_OPTIONS.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={row.cluster}
                    onValueChange={(value) => handleSpreadsheetRowChange(row.id, 'cluster', value)}
                    disabled={!row.city}
                  >
                    <SelectTrigger className={row.isValid === false && !row.cluster ? "border-red-500" : ""}>
                      <SelectValue placeholder={!row.city ? "Select city first" : "Select cluster"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableClustersForRow(row.city).map(cluster => (
                        <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.manager}
                    onChange={(e) => handleSpreadsheetRowChange(row.id, 'manager', e.target.value)}
                    placeholder="Manager Name"
                    className={row.isValid === false && !row.manager ? "border-red-500" : ""}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.role}
                    onValueChange={(value) => handleSpreadsheetRowChange(row.id, 'role', value as DashboardRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DashboardRole.ADMIN}>Admin</SelectItem>
                      <SelectItem value={DashboardRole.OPS_HEAD}>Ops Head</SelectItem>
                      <SelectItem value={DashboardRole.SECURITY_MANAGER}>Security Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.phone || ""}
                    onChange={(e) => handleSpreadsheetRowChange(row.id, 'phone', e.target.value)}
                    placeholder="Phone (optional)"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpreadsheetRow(row.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={10}>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-center py-2 border border-dashed border-gray-300"
                  onClick={addSpreadsheetRow}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={saveSpreadsheetRows}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            <Check className="mr-2 h-4 w-4" />
            Save Users
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetMode;
