
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import { Issue, IssueComment } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentSectionProps {
  issue: Issue;
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: () => void;
  isSubmittingComment: boolean;
  commenterNames: Record<string, string>;
  formatDate: (date: string) => string;
  currentUser: string;
  canReplyToEmployee?: boolean;
}

const CommentSection = ({
  issue,
  newComment,
  setNewComment,
  handleAddComment,
  isSubmittingComment,
  commenterNames,
  formatDate,
  currentUser,
  canReplyToEmployee = true
}: CommentSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Is ticket closed or resolved?
  const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <MessageSquare className="mr-2 h-5 w-5" />
          Comments
          {issue.comments.length > 0 && (
            <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">
              {issue.comments.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issue.comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No comments yet</p>
          </div>
        ) : (
          <div
            className={`space-y-4 ${
              !isExpanded && issue.comments.length > 3
                ? "max-h-[400px] overflow-y-auto"
                : ""
            }`}
          >
            {/* Show all comments or just the first 3 if not expanded */}
            {(isExpanded
              ? issue.comments
              : issue.comments.slice(-3)
            ).map((comment: IssueComment) => (
              <div
                key={comment.id}
                className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200">
                    {getInitials(
                      commenterNames[comment.employeeUuid] || "UN"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      {commenterNames[comment.employeeUuid] ||
                        "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Show button to expand/collapse comments if there are more than 3 */}
            {issue.comments.length > 3 && (
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded
                  ? "Show less comments"
                  : `Show all ${issue.comments.length} comments`}
              </Button>
            )}
          </div>
        )}

        {/* Only show add comment if ticket is not closed/resolved */}
        {!isClosedOrResolved ? (
          <>
            {!canReplyToEmployee && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800">Restricted Reply Access</h4>
                    <p className="text-sm text-orange-700">
                      Only HR Admin and Super Admin users can reply directly to the employee. 
                      Please use the internal comments section above to communicate with the team.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {canReplyToEmployee && (
              <>
                <Textarea
                  placeholder="Add a comment visible to the employee..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[100px] resize-none"
                  disabled={isSubmittingComment || !canReplyToEmployee}
                />
                <div className="text-xs text-gray-500">
                  <strong>Note:</strong> This comment will be visible to the employee.
                  Press Ctrl+Enter to submit quickly.
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-600">
            This ticket is {issue.status}. New comments cannot be added.
          </div>
        )}
      </CardContent>
      
      {!isClosedOrResolved && canReplyToEmployee && (
        <CardFooter className="border-t pt-3">
          <Button
            onClick={handleAddComment}
            disabled={
              !newComment.trim() ||
              isSubmittingComment ||
              isClosedOrResolved ||
              !canReplyToEmployee
            }
            className="ml-auto"
          >
            {isSubmittingComment && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reply to Employee
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CommentSection;
