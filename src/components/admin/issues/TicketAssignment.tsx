
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface TicketAssignmentProps {
  availableAssignees: { value: string; label: string }[];
  currentAssigneeId: string | null;
  currentAssigneeName: string;
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
  onAssign,
}: TicketAssignmentProps) => {
  // Determine if the current assignee is unknown or not found in the dropdown
  const assigneeNotInDropdown = currentAssigneeId && 
    !availableAssignees.some(a => a.value === currentAssigneeId) && 
    currentAssigneeName.includes("Unknown");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Currently Assigned To:</h3>
            <p className={`text-gray-800 ${assigneeNotInDropdown ? "text-amber-600" : ""}`}>
              {currentAssigneeName}
              {assigneeNotInDropdown && (
                <span className="block text-xs text-amber-600 mt-1">
                  This user may have been removed or renamed
                </span>
              )}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Assign To:</h3>
            <Select
              value={selectedAssigneeId}
              onValueChange={onAssigneeSelect}
              disabled={isAssigning}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableAssignees.map((assignee) => (
                  <SelectItem key={assignee.value} value={assignee.value}>
                    {assignee.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button
          onClick={onAssign}
          disabled={!selectedAssigneeId || isAssigning || selectedAssigneeId === currentAssigneeId}
          className="w-full"
        >
          {isAssigning ? "Assigning..." : "Assign Ticket"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketAssignment;
