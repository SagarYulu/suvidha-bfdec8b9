
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; 
import AdminLayout from "@/components/AdminLayout";
import { getIssues } from "@/services/issues/issueFilters";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { mapEmployeeUuidsToNames } from "@/services/issues/issueUtils"; 
import { updateAllIssuePriorities } from "@/services/issues/priorityUpdateService";
import { Issue } from "@/types";
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
import { Search, Eye, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminIssues = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Issue["status"] | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isUpdatingPriorities, setIsUpdatingPriorities] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      try {
        const fetchedIssues = await getIssues();
        setIssues(fetchedIssues);
        setFilteredIssues(fetchedIssues);
        
        // Use the utility to map employee UUIDs to names
        const employeeUuids = fetchedIssues.map(issue => issue.employeeUuid);
        const names = await mapEmployeeUuidsToNames(employeeUuids);
        
        // Add current admin user to the names list for future comments
        if (authState.user && authState.user.id) {
          names[authState.user.id] = authState.user.name;
        }
        
        setUserNames(names);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [authState.user]);

  useEffect(() => {
    let filtered = [...issues];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
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
    
    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, userNames]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewIssue = (issueId: string) => {
    navigate(`/admin/issues/${issueId}`);
  };
  
  const handleUpdatePriorities = async () => {
    setIsUpdatingPriorities(true);
    try {
      await updateAllIssuePriorities();
      // Refresh issues list to show updated priorities
      const refreshedIssues = await getIssues();
      setIssues(refreshedIssues);
      toast({
        title: "Success",
        description: "Ticket priorities have been updated",
      });
    } catch (error) {
      console.error("Error updating priorities:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket priorities",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPriorities(false);
    }
  };

  return (
    <AdminLayout title="Tickets Management" requiredPermission="manage:issues">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-48">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as Issue["status"] | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline"
              onClick={handleUpdatePriorities}
              disabled={isUpdatingPriorities}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdatingPriorities ? 'animate-spin' : ''}`} />
              Update Priorities
            </Button>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">
              Showing {filteredIssues.length} of {issues.length} tickets
            </span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(issue.createdAt)}</TableCell>
                    <TableCell>{formatDate(issue.updatedAt)}</TableCell>
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
                
                {filteredIssues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      {searchTerm || statusFilter !== "all"
                        ? "No tickets matching filters"
                        : "No tickets found"
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminIssues;
