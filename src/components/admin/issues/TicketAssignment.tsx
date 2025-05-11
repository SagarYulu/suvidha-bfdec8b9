
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DashboardUser } from "@/types";

interface AssigneeInfo {
  id: string;
  name: string;
  role?: string;
}

interface TicketAssignmentProps {
  availableAssignees: AssigneeInfo[];
  currentAssigneeId: string | null;
  currentAssigneeName: string | null;
  selectedAssigneeId: string;
  isAssigning: boolean;
  onAssigneeSelect: (assigneeId: string) => void;
  onAssign: () => void;
}

const TicketAssignment = ({ 
  availableAssignees,
  currentAssigneeId,
  currentAssigneeName,
  selectedAssigneeId,
  isAssigning,
  onAssigneeSelect,
  onAssign
}: TicketAssignmentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Ticket</CardTitle>
        <CardDescription>Assign this ticket to a dashboard user</CardDescription>
      </CardHeader>
      <CardContent>
        {availableAssignees.length > 0 ? (
          <div className="space-y-4">
            <Select
              value={selectedAssigneeId}
              onValueChange={onAssigneeSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {availableAssignees.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} {user.role ? `(${user.role})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={onAssign}
              className="w-full"
              disabled={isAssigning || !selectedAssigneeId}
            >
              {isAssigning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              Assign Ticket
            </Button>
            
            {currentAssigneeId && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium">Currently assigned to:</p>
                <p className="text-blue-600">
                  {currentAssigneeName || "Unknown user"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No users available for assignment</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketAssignment;
