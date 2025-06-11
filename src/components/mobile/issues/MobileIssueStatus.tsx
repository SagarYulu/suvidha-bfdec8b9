
import { Issue } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, RotateCcw } from "lucide-react";

interface MobileIssueStatusProps {
  issue: Issue;
  formatDate: (date: string) => string;
  isReopenable: boolean;
  handleReopenTicket: () => void;
}

const MobileIssueStatus = ({
  issue,
  formatDate,
  isReopenable,
  handleReopenTicket
}: MobileIssueStatusProps) => {
  const getStatusBadgeColor = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-orange-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "Open";
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: Issue["status"]) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Badge className={`text-white ${getStatusBadgeColor(issue.status)} flex items-center`}>
            {getStatusIcon(issue.status)}
            {getStatusText(issue.status)}
          </Badge>
        </div>
        
        {isReopenable && (
          <Button
            onClick={handleReopenTicket}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reopen
          </Button>
        )}
      </div>
      
      {isClosedOrResolved && issue.closedAt && (
        <p className="text-xs text-gray-500 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          Closed on {formatDate(issue.closedAt)}
        </p>
      )}
      
      {issue.resolvedAt && (
        <p className="text-xs text-gray-500 mt-1">
          Resolved on {formatDate(issue.resolvedAt)}
        </p>
      )}
    </div>
  );
};

export default MobileIssueStatus;
