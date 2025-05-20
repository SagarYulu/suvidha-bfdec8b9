
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitFeedbackButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

const SubmitFeedbackButton: React.FC<SubmitFeedbackButtonProps> = ({
  isSubmitting,
  onSubmit
}) => {
  return (
    <div className="mt-6 sticky bottom-0 pb-4">
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-600 text-gray-800 font-medium rounded-full py-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Feedback"
        )}
      </Button>
    </div>
  );
};

export default SubmitFeedbackButton;
