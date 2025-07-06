
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ClosedIssueCommentNoticeProps {
  isReopenable: boolean;
  onReopen: (issueId: string) => void;
  issueId: string;
  employeeUuid: string;
}

const ClosedIssueCommentNotice: React.FC<ClosedIssueCommentNoticeProps> = ({
  isReopenable,
  onReopen,
  issueId
}) => {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm text-gray-700">
          <p>This ticket is closed. You cannot add new comments.</p>
          <p className="text-gray-500 mt-1 text-xs">यह टिकट बंद है। आप नई टिप्पणियां नहीं जोड़ सकते।</p>
        </div>

        {isReopenable && (
          <Button
            onClick={() => onReopen(issueId)}
            className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Clock className="h-4 w-4" />
            <span>Reopen Ticket / टिकट फिर से खोलें</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClosedIssueCommentNotice;
