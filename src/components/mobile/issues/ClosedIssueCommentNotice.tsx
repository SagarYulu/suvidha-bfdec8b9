
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lock, RefreshCw, MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import FeedbackDialog from "./FeedbackDialog";
import { checkFeedbackExists } from "@/services/ticketFeedbackService";

interface ClosedIssueCommentNoticeProps {
  isReopenable: boolean;
  onReopen: (reason: string) => Promise<void>;
  issueId: string;
  employeeUuid: string;
}

const ClosedIssueCommentNotice = ({ 
  isReopenable, 
  onReopen,
  issueId,
  employeeUuid
}: ClosedIssueCommentNoticeProps) => {
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(true);

  useEffect(() => {
    const checkForExistingFeedback = async () => {
      if (issueId && employeeUuid) {
        setCheckingFeedback(true);
        console.log("Checking for existing feedback:", issueId, employeeUuid);
        const exists = await checkFeedbackExists(issueId, employeeUuid);
        console.log("Has existing feedback:", exists);
        setHasFeedback(exists);
        setCheckingFeedback(false);
        
        // Auto-show feedback dialog if no feedback yet
        if (!exists) {
          setTimeout(() => {
            setShowFeedbackDialog(true);
          }, 500);
        }
      }
    };

    checkForExistingFeedback();
  }, [issueId, employeeUuid]);

  const handleReopen = async () => {
    if (!reopenReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReopen(reopenReason);
      setShowReopenForm(false);
      setReopenReason("");
    } catch (error) {
      console.error("Error reopening ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 my-4">
      <div className="flex justify-center mb-2">
        <Lock className="h-6 w-6 text-gray-500" />
      </div>
      <h3 className="text-gray-700 font-medium text-center">Chat Closed</h3>
      <p className="text-gray-500 text-sm mt-1 text-center">
        You can't add new comments to a closed ticket.
      </p>

      {!checkingFeedback && !hasFeedback && (
        <div className="mt-4">
          <Button 
            variant="secondary"
            onClick={() => setShowFeedbackDialog(true)}
            className="w-full flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Share your feedback / अपनी प्रतिक्रिया साझा करें
          </Button>
        </div>
      )}
      
      {!checkingFeedback && hasFeedback && (
        <div className="mt-4 text-center text-sm text-green-600">
          Thank you for sharing your feedback! / आपकी प्रतिक्रिया के लिए धन्यवाद!
        </div>
      )}

      {isReopenable && !showReopenForm && (
        <div className="mt-4">
          <Button 
            variant="outline"
            onClick={() => setShowReopenForm(true)}
            className="w-full flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reopen Ticket
          </Button>
          <div className="flex items-center mt-2 text-xs text-amber-600 justify-center">
            <span>You can reopen this ticket within 7 days of closure</span>
          </div>
        </div>
      )}

      {isReopenable && showReopenForm && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Please provide a reason for reopening:</p>
          <Textarea
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Enter reason for reopening..."
            className="min-h-[80px] mb-3"
          />
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowReopenForm(false);
                setReopenReason("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleReopen}
              disabled={!reopenReason.trim() || isSubmitting}
            >
              {isSubmitting ? "Reopening..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog 
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        issueId={issueId}
        employeeUuid={employeeUuid}
      />
    </div>
  );
};

export default ClosedIssueCommentNotice;
