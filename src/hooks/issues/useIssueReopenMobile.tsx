
import { useState } from "react";
import { Issue } from "@/types";
import { reopenTicket } from "@/services/issues/issueReopeningService";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const useIssueReopenMobile = (
  issueId: string | undefined, 
  currentUserId: string,
  setIssue: (issue: Issue) => void
) => {
  const [reopenReason, setReopenReason] = useState<string>("");
  const [isReopeningTicket, setIsReopeningTicket] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);

  // Display dialog for reopening ticket
  const handleReopenTicket = () => {
    setShowReopenDialog(true);
  };
  
  // Process the actual reopening with reason
  const processReopenTicket = async () => {
    if (!issueId || !currentUserId || !reopenReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for reopening the ticket",
        variant: "destructive",
      });
      return;
    }
    
    setIsReopeningTicket(true);
    try {
      const updatedIssue = await reopenTicket(issueId, reopenReason, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setShowReopenDialog(false);
        setReopenReason("");
        toast({
          title: "Success",
          description: "Ticket reopened successfully",
        });
      }
    } catch (error) {
      console.error("Error reopening ticket:", error);
      toast({
        title: "Error",
        description: "Failed to reopen ticket",
        variant: "destructive",
      });
    } finally {
      setIsReopeningTicket(false);
    }
  };

  const ReopenDialog = () => (
    <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reopen Ticket</DialogTitle>
          <DialogDescription>
            Please provide a reason for reopening this ticket.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Enter reason for reopening..."
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowReopenDialog(false)}
            disabled={isReopeningTicket}
          >
            Cancel
          </Button>
          <Button 
            onClick={processReopenTicket}
            disabled={!reopenReason.trim() || isReopeningTicket}
          >
            {isReopeningTicket ? "Reopening..." : "Reopen Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    reopenReason,
    setReopenReason,
    isReopeningTicket,
    showReopenDialog,
    setShowReopenDialog,
    handleReopenTicket,
    processReopenTicket,
    ReopenDialog
  };
};
