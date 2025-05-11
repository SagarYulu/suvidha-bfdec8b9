
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Issue } from "@/types";
import { Clock, AlertTriangle } from "lucide-react";

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
  const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";
  
  const getStatusBadgeColor = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      case "closed":
        return "bg-green-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (isClosedOrResolved) return null;
    
    switch (priority) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Priority</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High Priority</Badge>;
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <Badge className={`px-3 py-1 ${getStatusBadgeColor(issue.status)}`}>
          {issue.status.replace("_", " ")}
        </Badge>
        {getPriorityBadge(issue.priority)}
      </div>
      
      {isClosedOrResolved && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Closed on {formatDate(issue.closedAt || "")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileIssueStatus;
