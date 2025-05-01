
import { useState } from "react";
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
import { Plus, Trash, Check, X } from "lucide-react";

// Type for our spreadsheet rows
interface SpreadsheetRow {
  id: string;
  name: string;
  email: string;
  role: DashboardRole;
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
    role: DashboardRole.OPS_HEAD,
    isNew: true
  }]);
  const [isLoading, setIsLoading] = useState(false);

  // Add a new empty row to the spreadsheet
  const addSpreadsheetRow = () => {
    setSpreadsheetRows(prev => [
      ...prev, 
      {
        id: `row-${Date.now()}`,
        name: "",
        email: "",
        role: DashboardRole.OPS_HEAD,
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
      prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
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

  // Validate all rows in the spreadsheet
  const validateSpreadsheetRows = () => {
    return setSpreadsheetRows(prev => 
      prev.map(row => ({
        ...row,
        isValid: !!row.name && !!row.email && !!row.role && validateEmail(row.email)
      }))
    );
  };

  // Save all valid rows from the spreadsheet
  const saveSpreadsheetRows = async () => {
    validateSpreadsheetRows();
    
    // Filter out valid rows
    const validRows = spreadsheetRows.filter(row => 
      row.name && row.email && row.role && validateEmail(row.email)
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
        role: row.role,
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spreadsheetRows.map((row, index) => (
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
            <TableCell colSpan={5}>
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
          className="bg-yulu-blue hover:bg-blue-700 flex items-center"
        >
          <Check className="mr-2 h-4 w-4" />
          Save Users
        </Button>
      </div>
    </div>
  );
};

export default SpreadsheetMode;
