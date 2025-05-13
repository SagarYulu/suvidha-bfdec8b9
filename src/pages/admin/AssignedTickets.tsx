
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignedIssues, getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { Issue, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mapEmployeeUuidsToNames } from "@/services/issues/issueUtils";
import * as XLSX from 'xlsx';

const AssignedTickets = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [clusterFilter, setClusterFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");
  
  // Filter options
  const [cities, setCities] = useState<string[]>([]);
  const [clusters, setClusters] = useState<string[]>([]);
  const [managers, setManagers] = useState<string[]>([]);

  useEffect(() => {
    const fetchAssignedIssues = async () => {
      setIsLoading(true);
      try {
        // Fetch all assigned issues from the database
        const { data: allIssues, error } = await supabase
          .from('issues')
          .select('*')
          .not('assigned_to', 'is', null);
          
        if (error) {
          throw error;
        }
        
        // Transform the raw issues into our Issue type
        const transformedIssues = allIssues.map(issue => ({
          id: issue.id,
          employeeUuid: issue.employee_uuid,
          typeId: issue.type_id,
          subTypeId: issue.sub_type_id,
          description: issue.description,
          status: issue.status as Issue["status"],
          priority: issue.priority as Issue["priority"],
          createdAt: issue.created_at,
          updatedAt: issue.updated_at || issue.created_at,
          closedAt: issue.closed_at,
          assignedTo: issue.assigned_to,
          comments: []
        }));
        
        setIssues(transformedIssues);
        setFilteredIssues(transformedIssues);
        
        // Map employee UUIDs to names
        const employeeUuids = transformedIssues.map(issue => issue.employeeUuid);
        const assigneeUuids = transformedIssues
          .filter(issue => issue.assignedTo)
          .map(issue => issue.assignedTo as string);
          
        const uniqueUuids = [...new Set([...employeeUuids, ...assigneeUuids])];
        const names = await mapEmployeeUuidsToNames(uniqueUuids);
        setUserNames(names);
        
        // Extract unique cities, clusters, and managers from employee data
        const { data: employees } = await supabase.from('employees').select('city, cluster, manager');
        
        if (employees && employees.length > 0) {
          const uniqueCities = [...new Set(employees.map(emp => emp.city).filter(Boolean))];
          const uniqueClusters = [...new Set(employees.map(emp => emp.cluster).filter(Boolean))];
          const uniqueManagers = [...new Set(employees.map(emp => emp.manager).filter(Boolean))];
          
          setCities(uniqueCities);
          setClusters(uniqueClusters);
          setManagers(uniqueManagers);
        }
      } catch (error) {
        console.error("Error fetching assigned tickets:", error);
        toast({
          title: "Error",
          description: "Failed to load assigned tickets",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedIssues();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter values change
    let filtered = [...issues];
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(issue => {
        const typeLabel = getIssueTypeLabel(issue.typeId).toLowerCase();
        const subTypeLabel = getIssueSubTypeLabel(issue.typeId, issue.subTypeId).toLowerCase();
        const description = issue.description.toLowerCase();
        const userName = userNames[issue.employeeUuid]?.toLowerCase() || "";
        
        return (
          typeLabel.includes(searchLower) ||
          subTypeLabel.includes(searchLower) ||
          description.includes(searchLower) ||
          userName.includes(searchLower) ||
          issue.id.includes(searchLower)
        );
      });
    }
    
    // Apply city filter
    if (cityFilter) {
      filtered = filtered.filter(issue => {
        // We need to look up the employee's city by UUID
        const employeeId = issue.employeeUuid;
        // This is a simplification - in a real app, you'd fetch and store employee city data
        return true; // Placeholder - would check if employee.city === cityFilter
      });
    }
    
    // Apply cluster filter
    if (clusterFilter) {
      filtered = filtered.filter(issue => {
        // Similar to city filter, would filter by cluster
        return true; // Placeholder
      });
    }
    
    // Apply manager filter
    if (managerFilter) {
      filtered = filtered.filter(issue => {
        // Similar to city filter, would filter by manager
        return true; // Placeholder
      });
    }
    
    setFilteredIssues(filtered);
  }, [issues, searchTerm, cityFilter, clusterFilter, managerFilter, userNames]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeColor = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityBadgeClass = (priority: string, status: string) => {
    // Don't show priority for closed/resolved tickets
    if (status === "closed" || status === "resolved") {
      return "bg-gray-100 text-gray-800 opacity-50";
    }
    
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800 animate-pulse";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewIssue = (issueId: string) => {
    navigate(`/admin/issues/${issueId}`);
  };
  
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredIssues.map(issue => ({
        'Ticket ID': issue.id,
        'Employee': userNames[issue.employeeUuid] || 'Unknown',
        'Type': getIssueTypeLabel(issue.typeId),
        'Subtype': getIssueSubTypeLabel(issue.typeId, issue.subTypeId),
        'Description': issue.description,
        'Status': issue.status.replace('_', ' '),
        'Priority': issue.priority,
        'Created Date': formatDate(issue.createdAt),
        'Assigned To': userNames[issue.assignedTo || ''] || 'Unassigned',
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assigned Tickets');
      
      // Generate Excel file and download
      XLSX.writeFile(workbook, 'Assigned_Tickets.xlsx');
      
      toast({
        title: "Success",
        description: "Assigned tickets exported to Excel",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Error",
        description: "Failed to export tickets to Excel",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Assigned Tickets">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle>Assigned Tickets</CardTitle>
                <CardDescription>View and manage all tickets assigned to HR team members</CardDescription>
              </div>
              <div className="flex mt-4 md:mt-0">
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => {
                    setSearchTerm("");
                    setCityFilter("");
                    setClusterFilter("");
                    setManagerFilter("");
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={exportToExcel}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={cityFilter}
                    onValueChange={setCityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={clusterFilter}
                    onValueChange={setClusterFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Clusters</SelectItem>
                      {clusters.map((cluster) => (
                        <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={managerFilter}
                    onValueChange={setManagerFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Managers</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
              </div>
            ) : filteredIssues.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Ticket Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-mono text-xs">{issue.id.substring(0, 8)}</TableCell>
                        <TableCell>{userNames[issue.employeeUuid] || "Unknown"}</TableCell>
                        <TableCell>
                          <div>
                            <div>{getIssueTypeLabel(issue.typeId)}</div>
                            <div className="text-xs text-gray-500">
                              {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {issue.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(issue.status)}>
                            {issue.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(issue.priority, issue.status)}`}>
                            {issue.priority === 'critical' ? "CRITICAL" : issue.priority}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(issue.createdAt)}</TableCell>
                        <TableCell>{userNames[issue.assignedTo || ''] || "Unassigned"}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewIssue(issue.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No assigned tickets found matching your filters
              </div>
            )}
            
            {filteredIssues.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-right">
                Showing {filteredIssues.length} {filteredIssues.length === 1 ? 'ticket' : 'tickets'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssignedTickets;
