
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface SubmitFeedbackButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

const SubmitFeedbackButton: React.FC<SubmitFeedbackButtonProps> = ({
  isSubmitting,
  onSubmit
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-yulu-dashboard-blue to-yulu-dashboard-blue/90">
      <Button 
        className="w-full bg-white hover:bg-white/90 text-yulu-dashboard-blue hover:text-yulu-dashboard-blue text-lg font-medium py-6 rounded-xl shadow-lg"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Submit Feedback
          </>
        )}
      </Button>
    </div>
  );
};

export default SubmitFeedbackButton;
