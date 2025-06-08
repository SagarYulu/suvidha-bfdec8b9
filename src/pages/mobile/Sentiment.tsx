
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MobileSentiment = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setRating(0);
      setFeedback("");
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout title="Share Feedback" bgColor="bg-yulu-dashboard-blue">
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">How was your experience?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Star Rating */}
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Rating Text */}
            {rating > 0 && (
              <div className="text-center">
                <p className="text-lg font-medium">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>
            )}

            {/* Feedback Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tell us more (optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="w-full bg-yulu-dashboard-blue hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default MobileSentiment;
