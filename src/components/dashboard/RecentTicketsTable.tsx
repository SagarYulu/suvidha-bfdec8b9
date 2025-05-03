
import React, { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Issue } from "@/types";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { mapEmployeeUuidsToNames } from "@/services/issues/issueUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type RecentTicketsTableProps = {
  recentIssues: Issue[];
  isLoading: boolean;
};

// Using memo to prevent unnecessary re-renders
const RecentTicketsTable = memo(({ recentIssues, isLoading }: RecentTicketsTableProps) => {
  const navigate = useNavigate();
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});

  // Fetch employee names when issues change
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      if (recentIssues.length === 0) return;
      
      // Get unique employee IDs
      const uniqueEmployeeIds = [...new Set(recentIssues.map(issue => issue.employeeUuid))];
      
      // Use the utility function to get all names at once
      try {
        const names = await mapEmployeeUuidsToNames(uniqueEmployeeIds);
        setEmployeeNames(names);
      } catch (error) {
        console.error("Error fetching employee names:", error);
      }
    };
    
    fetchEmployeeNames();
  }, [recentIssues]);

  const handleViewIssue = (issueId: string) => {
    console.log("Navigating to issue details with ID:", issueId);
    navigate(`/admin/issues/${issueId}`);
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
                        "bg-green-100 text-green-800"
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        issue.priority === "high" ? "bg-red-100 text-red-800" :
                        issue.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
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
