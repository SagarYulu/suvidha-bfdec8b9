
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
import { Eye } from "lucide-react";

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

  // Get priority badge class based on priority level
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
                {recentIssues.map((issue) => (
                  <TableRow key={issue.id}>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        issue.status === "open" ? "bg-red-100 text-red-800" :
                        issue.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                        issue.status === "resolved" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(issue.updatedAt).toLocaleDateString()}
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
                ))}
                
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
