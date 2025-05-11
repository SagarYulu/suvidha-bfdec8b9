
import { Lock } from "lucide-react";

const ClosedIssueCommentNotice = () => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 text-center my-4">
      <div className="flex justify-center mb-2">
        <Lock className="h-6 w-6 text-gray-500" />
      </div>
      <h3 className="text-gray-700 font-medium">Chat Closed</h3>
      <p className="text-gray-500 text-sm mt-1">
        You can't add new comments to a closed ticket.
        If you need further assistance, please reopen the ticket.
      </p>
    </div>
  );
};

export default ClosedIssueCommentNotice;
