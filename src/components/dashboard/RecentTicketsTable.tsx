
import React, { memo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Issue } from "@/types";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { getUserById } from "@/services/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Eye, AlertCircle } from "lucide-react";

type RecentTicketsTableProps = {
  recentIssues: Issue[];
  isLoading: boolean;
};

// Using memo to prevent unnecessary re-renders
const RecentTicketsTable = memo(({ recentIssues, isLoading }: RecentTicketsTableProps) => {
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const navigate = useNavigate(); // Add navigate hook

  // Fetch employee names when issues change
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      if (recentIssues.length === 0) return;
      
      // Get unique employee IDs
      const uniqueEmployeeIds = [...new Set(recentIssues.map(issue => issue.employeeUuid))];
      
      // Fetch names for each unique employee ID
      const names: Record<string, string> = {};
      
      for (const employeeId of uniqueEmployeeIds) {
        try {
          if (!employeeId) {
            names[""] = "Unknown"; 
            continue;
          }

          // Special handling for system users
          if (employeeId === "system" || employeeId === "admin-fallback") {
            names[employeeId] = employeeId === "system" ? "System" : "Admin";
            continue;
          }

          const user = await getUserById(employeeId);
          if (user) {
            names[employeeId] = user.name;
          } else {
            // Handle special cases with more descriptive names
            if (employeeId === "1") {
              names[employeeId] = "Admin";
            } else if (employeeId.startsWith("security-user")) {
              names[employeeId] = "Security Team";
            } else {
              names[employeeId] = "Unknown User";
            }
          }
        } catch (error) {
          console.error(`Error fetching name for employee ${employeeId}:`, error);
          names[employeeId] = "Unknown";
        }
      }
      
      setEmployeeNames(names);
    };
    
    fetchEmployeeNames();
  }, [recentIssues]);

  // Function to handle viewing issue details
  const handleViewIssue = (issueId: string) => {
    console.log("Navigating to issue:", issueId);
    if (issueId) {
      navigate(`/admin/issues/${issueId}`);
    }
  };

  // Get status badge class based on status value - UPDATED to match Issues page
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

  // Get priority badge class - UPDATED to match Issues page
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {recentIssues.length > 0 ? (
          <div className="overflow-x-auto">
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
                {recentIssues.map((issue) => {
                  // Check if issue has breached SLA
                  const isBreachedSLA = issue.priority === 'critical' && 
                    issue.status !== 'closed' && 
                    issue.status !== 'resolved';
                  
                  return (
                    <TableRow 
                      key={issue.id}
                      className={isBreachedSLA ? "bg-red-50" : undefined}
                    >
                      <TableCell className="font-mono text-xs">{issue.id.substring(0, 8)}</TableCell>
                      <TableCell>{employeeNames[issue.employeeUuid] || "Loading..."}</TableCell>
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
                        {(issue.status === "closed" || issue.status === "resolved") ? (
                          <span className="text-xs text-gray-500 italic">N/A</span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(issue.priority, issue.status)}`}>
                            {issue.priority === 'critical' ? "CRITICAL" : issue.priority}
                            {isBreachedSLA && (
                              <span className="block text-xs text-red-600 font-medium mt-1">
                                SLA Breach
                              </span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(issue.createdAt)}
                      </TableCell>
                      <TableCell>
                        {formatDate(issue.updatedAt)}
                      </TableCell>
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
                  );
                })}
                
                {recentIssues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      No tickets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No recent tickets found
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Display name for debugging
RecentTicketsTable.displayName = 'RecentTicketsTable';

export default RecentTicketsTable;
