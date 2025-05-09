
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { Issue } from "@/types";

interface IssueDetailsCardProps {
  issue: Issue;
  status: Issue["status"];
  handleStatusChange: (newStatus: Issue["status"]) => void;
  isUpdatingStatus: boolean;
  formatDate: (date: string) => string;
  getIssueTypeLabel: (typeId: string) => string;
  getIssueSubTypeLabel: (typeId: string, subTypeId: string) => string;
}

const IssueDetailsCard = ({ 
  issue, 
  status, 
  handleStatusChange, 
  isUpdatingStatus, 
  formatDate, 
  getIssueTypeLabel, 
  getIssueSubTypeLabel 
}: IssueDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{getIssueTypeLabel(issue.typeId)}</CardTitle>
            <CardDescription>{getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}</CardDescription>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              Created: {formatDate(issue.createdAt)}
            </div>
            {issue.closedAt && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Closed: {formatDate(issue.closedAt)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">Description:</h3>
        <p className="text-gray-700">{issue.description}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <div className="flex items-center">
            <span className="font-medium mr-2">Priority:</span>
            <Badge variant="outline" className="capitalize">
              {issue.priority}
            </Badge>
          </div>
          <div>
            <span className="font-medium mr-2">Status:</span>
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueDetailsCard;
