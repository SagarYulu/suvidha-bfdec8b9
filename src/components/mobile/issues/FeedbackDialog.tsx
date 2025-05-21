
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitTicketFeedback, TicketFeedback } from "@/services/ticketFeedbackService";
import { Smile, Meh, Frown } from "lucide-react";

interface FeedbackOption {
  value: string;
  label: string;
  labelHindi: string;
}

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  employeeUuid: string;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  issueId,
  employeeUuid,
}) => {
  const [step, setStep] = useState<"sentiment" | "options" | "submitted">("sentiment");
  const [sentiment, setSentiment] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define feedback options based on sentiment
  const feedbackOptions: Record<string, FeedbackOption[]> = {
    happy: [
      {
        value: "understood_issue",
        label: "Suvidha agent understood my issue",
        labelHindi: "Suvidha agent mera problem ko samjha",
      },
      {
        value: "resolved_query",
        label: "My query resolved",
        labelHindi: "Meri query resolve ho gayi",
      },
      {
        value: "fast_resolution",
        label: "Speed of the resolution",
        labelHindi: "Problem ko jaldi solve kiya",
      },
    ],
    neutral: [
      {
        value: "took_longer",
        label: "Resolution took longer than expected",
        labelHindi: "Samasya hal hone mein zyada samay laga",
      },
      {
        value: "multiple_followups",
        label: "Had to follow up multiple times",
        labelHindi: "Bar-bar follow-up karna pada",
      },
      {
        value: "polite_not_helpful",
        label: "Agent was polite but not very helpful",
        labelHindi: "Agent vinamr the par pura support nahi mila",
      },
    ],
    sad: [
      {
        value: "didnt_understand",
        label: "Suvidha agent didn't understand my issue",
        labelHindi: "Suvidha agent mera issue samjha nahi",
      },
      {
        value: "query_not_solved",
        label: "My query didn't get solved",
        labelHindi: "Mera query resolve nahi hua",
      },
      {
        value: "delayed_resolution",
        label: "Resolution was delayed",
        labelHindi: "Issue clear karne mein bahut time laga",
      },
    ],
  };

  const getHeaderText = () => {
    switch (sentiment) {
      case "happy":
        return "What went well? / क्या अच्छा रहा?";
      case "neutral":
        return "What could have been better? / क्या बेहतर हो सकता था?";
      case "sad":
        return "What went wrong? / क्या गलत हुआ?";
      default:
        return "Share your feedback / अपनी प्रतिक्रिया साझा करें";
    }
  };

  const handleSentimentSelect = (value: "happy" | "neutral" | "sad") => {
    setSentiment(value);
    setStep("options");
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  const handleSubmit = async () => {
    if (!sentiment || !selectedOption) return;

    setIsSubmitting(true);
    
    const feedback: TicketFeedback = {
      issue_id: issueId,
      employee_uuid: employeeUuid,
      sentiment,
      feedback_option: selectedOption,
    };

    const success = await submitTicketFeedback(feedback);
    
    if (success) {
      setStep("submitted");
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    // Reset state when closing
    if (step === "submitted") {
      setSentiment(null);
      setSelectedOption("");
      setStep("sentiment");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getHeaderText()}</DialogTitle>
          {step === "sentiment" && (
            <DialogDescription className="text-center">
              Please select how you feel about the service
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "sentiment" && (
          <div className="flex justify-center gap-8 py-6">
            <button
              onClick={() => handleSentimentSelect("happy")}
              className="flex flex-col items-center gap-2 p-2 rounded-full hover:bg-gray-100"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Smile className="h-10 w-10 text-green-500" />
              </div>
              <span>Happy</span>
            </button>
            
            <button
              onClick={() => handleSentimentSelect("neutral")}
              className="flex flex-col items-center gap-2 p-2 rounded-full hover:bg-gray-100"
            >
              <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                <Meh className="h-10 w-10 text-yellow-500" />
              </div>
              <span>Neutral</span>
            </button>
            
            <button
              onClick={() => handleSentimentSelect("sad")}
              className="flex flex-col items-center gap-2 p-2 rounded-full hover:bg-gray-100"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Frown className="h-10 w-10 text-red-500" />
              </div>
              <span>Sad</span>
            </button>
          </div>
        )}

        {step === "options" && sentiment && (
          <div className="py-4">
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionSelect}
              className="space-y-4"
            >
              {feedbackOptions[sentiment].map((option) => (
                <div key={option.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                    <br />
                    <span className="text-gray-500">{option.labelHindi}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        )}

        {step === "submitted" && (
          <div className="py-8 text-center">
            <div className="text-2xl mb-4">✅</div>
            <h3 className="text-lg font-medium">
              Feedback Submitted / प्रतिक्रिया दी गई
            </h3>
            <p className="text-gray-500 mt-2">
              Thank you for your valuable feedback!
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
