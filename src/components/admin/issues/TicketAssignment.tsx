
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Issue, DashboardUser } from "@/types";

interface TicketAssignmentProps {
  issue: Issue;
  dashboardUsers: DashboardUser[];
  isAssigning: boolean;
  handleAssignIssue: () => void;
  selectedAssignee: string;
  setSelectedAssignee: (assignee: string) => void;
}

const TicketAssignment = ({ 
  issue, 
  dashboardUsers, 
  isAssigning, 
  handleAssignIssue, 
  selectedAssignee, 
  setSelectedAssignee 
}: TicketAssignmentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Ticket</CardTitle>
        <CardDescription>Assign this ticket to a dashboard user</CardDescription>
      </CardHeader>
      <CardContent>
        {dashboardUsers.length > 0 ? (
          <div className="space-y-4">
            <Select
              value={selectedAssignee}
              onValueChange={setSelectedAssignee}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {dashboardUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleAssignIssue}
              className="w-full"
              disabled={isAssigning || !selectedAssignee}
            >
              {isAssigning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              Assign Ticket
            </Button>
            
            {issue.assignedTo && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium">Currently assigned to:</p>
                <p className="text-blue-600">
                  {dashboardUsers.find(u => u.id === issue.assignedTo)?.name || "Unknown user"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No dashboard users available for assignment</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketAssignment;
