
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/types";
import { Clock } from "lucide-react";

interface IssueHeaderProps {
  issue: Issue;
  formatDate: (date: string) => string;
  getIssueTypeLabel: (typeId: string) => string;
  getIssueSubTypeLabel: (typeId: string, subTypeId: string) => string;
  getStatusBadgeColor: (status: Issue["status"]) => string;
}

const IssueHeader = ({ 
  issue, 
  formatDate, 
  getIssueTypeLabel, 
  getIssueSubTypeLabel,
  getStatusBadgeColor
}: IssueHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h2 className="font-semibold text-lg">
          {getIssueTypeLabel(issue.typeId)}
        </h2>
        <Badge className={getStatusBadgeColor(issue.status)}>
          {issue.status.replace("_", " ")}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
      </p>
      
      <div className="text-sm mb-4">
        <p className="flex items-center text-gray-500 mb-1">
          <Clock className="h-3 w-3 mr-1" />
          Created on {formatDate(issue.createdAt)}
        </p>
      </div>
      
      <div className="border-t border-gray-200 pt-3">
        <h3 className="font-medium mb-2">Description:</h3>
        <p className="text-gray-700">{issue.description}</p>
      </div>
    </div>
  );
};

export default IssueHeader;
