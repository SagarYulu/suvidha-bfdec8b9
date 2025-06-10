
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MobileSentiment = () => {
  const navigate = useNavigate();
  const [sentiment, setSentiment] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!sentiment || !feedback || rating === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Feedback submitted successfully!");
      setFeedback('');
      setSentiment('');
      setRating(0);
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-[#1E40AF] rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/mobile/issues')}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Share Your Feedback</h1>
        </div>
        <p className="text-blue-100">Help us improve by sharing your experience</p>
      </div>

      <div className="space-y-6">
        {/* Sentiment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={sentiment} onValueChange={setSentiment}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="positive" id="positive" />
                <Label htmlFor="positive" className="text-green-600 font-medium">😊 Positive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral" className="text-yellow-600 font-medium">😐 Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="negative" id="negative" />
                <Label htmlFor="negative" className="text-red-600 font-medium">😞 Negative</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rate your overall experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRatingClick(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </Button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                You rated: {rating} star{rating !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Feedback Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tell us more</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !sentiment || !feedback || rating === 0}
          className="w-full bg-[#1E40AF] hover:bg-[#1E40AF]/90"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Submit Feedback</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileSentiment;
