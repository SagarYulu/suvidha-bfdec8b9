
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { IssueComment } from "@/types";

interface AssigneeConversationProps {
  comments: IssueComment[];
  assigneeId?: string;
  assignerId?: string;
  isAssignee: boolean;
  isAssigner: boolean;
  commenterNames: Record<string, string>;
  currentUserId: string;
  formatDate: (date: string) => string;
  onSendPrivateMessage: (message: string) => Promise<void>;
}

const AssigneeConversation: React.FC<AssigneeConversationProps> = ({
  comments,
  assigneeId,
  assignerId,
  isAssignee,
  isAssigner,
  commenterNames,
  currentUserId,
  formatDate,
  onSendPrivateMessage
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Filter comments between assignee and assigner
  const privateMessages = comments.filter(comment => 
    (comment.employeeUuid === assigneeId || comment.employeeUuid === assignerId)
  );
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    try {
      setIsSending(true);
      await onSendPrivateMessage(newMessage);
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };
  
  // If user is neither assignee nor assigner, don't show the conversation
  if (!isAssignee && !isAssigner) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      <h3 className="font-medium mb-3">Assignment Communication</h3>
      
      <div className="max-h-[300px] overflow-y-auto space-y-3 mb-4">
        {privateMessages.length > 0 ? (
          privateMessages.map((message) => {
            const isCurrentUser = message.employeeUuid === currentUserId;
            const userName = commenterNames[message.employeeUuid] || "Unknown";
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      isCurrentUser ? 'ml-2 bg-indigo-600' : 'mr-2 bg-gray-600'
                    }`}
                  >
                    {userName[0] || "?"}
                  </div>
                  
                  <div 
                    className={`rounded-lg px-3 py-2 ${
                      isCurrentUser 
                        ? 'bg-indigo-100 text-indigo-900' 
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {isCurrentUser ? 'You' : userName}
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-500">
            No messages between assignee and assigner yet
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message for the assignee/assigner..."
          className="min-h-[60px] resize-none flex-grow"
          rows={2}
        />
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 h-[60px] aspect-square"
          disabled={isSending || !newMessage.trim()}
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default AssigneeConversation;
