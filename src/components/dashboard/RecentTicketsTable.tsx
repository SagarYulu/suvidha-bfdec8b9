
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Issue } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type RecentTicketsTableProps = {
  recentIssues: Issue[];
  isLoading: boolean;
};

const RecentTicketsTable = ({ recentIssues, isLoading }: RecentTicketsTableProps) => {
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
                    <TableCell>{issue.id}</TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <div>
                        <div></div>
                        <div className="text-xs text-gray-500">
                          
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
};

export default RecentTicketsTable;
