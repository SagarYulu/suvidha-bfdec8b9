
import { FormEvent, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { Issue } from "@/types";

interface CommentSectionProps {
  issue: Issue;
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: (e: React.FormEvent) => void;
  isSubmittingComment: boolean;
  commenterNames: Record<string, string>;
  formatDate: (date: string) => string;
  currentUser: string | undefined;
}

const CommentSection = ({ 
  issue, 
  newComment, 
  setNewComment, 
  handleAddComment, 
  isSubmittingComment,
  commenterNames,
  formatDate,
  currentUser
}: CommentSectionProps) => {
  // Prevent default form submission to avoid page reloads
  const onSubmitComment = (e: FormEvent) => {
    e.preventDefault();
    handleAddComment(e);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments ({issue.comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 max-h-[400px] overflow-y-auto p-2">
          {issue.comments.length > 0 ? (
            issue.comments.map((comment) => {
              // Check if this is the current admin user's comment
              const isAdmin = comment.employeeUuid === currentUser || 
                              comment.employeeUuid === "1" || 
                              comment.employeeUuid === "admin-fallback";
              
              const userName = commenterNames[comment.employeeUuid] || "Unknown user";
              const userInitial = userName.charAt(0).toUpperCase();
              
              return (
                <div 
                  key={comment.id} 
                  className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`flex max-w-[75%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
                        isAdmin ? 'ml-2 bg-blue-600' : 'mr-2 bg-yulu-blue'
                      }`}
                    >
                      {isAdmin ? 'A' : userInitial}
                    </div>
                    
                    <div 
                      className={`rounded-lg px-4 py-2 ${
                        isAdmin 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {userName}
                      </div>
                      <div className="text-sm">{comment.content}</div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No comments yet
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form onSubmit={onSubmitComment} className="w-full flex items-center">
          <div className="flex-grow mr-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <Button 
            type="submit" 
            className="bg-yulu-blue hover:bg-blue-700 h-[60px] px-4"
            disabled={isSubmittingComment || !newComment.trim()}
            onClick={(e) => {
              e.preventDefault();
              if (!isSubmittingComment && newComment.trim()) {
                handleAddComment(e);
              }
            }}
          >
            {isSubmittingComment ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default CommentSection;
