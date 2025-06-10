
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, Send, MessageSquare, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import MobileLayout from '@/components/layout/MobileLayout';
import { mobileApiService } from '@/services/mobileApiService';
import { useAuth } from '@/contexts/AuthContext';

const MobileFeedback = () => {
  const { authState } = useAuth();
  const [sentiment, setSentiment] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sentimentOptions = [
    { value: 'positive', label: 'Positive', icon: ThumbsUp, color: 'text-green-600' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-600' },
    { value: 'negative', label: 'Negative', icon: ThumbsDown, color: 'text-red-600' }
  ];

  const categoryOptions = [
    'Service Quality',
    'Response Time',
    'Issue Resolution',
    'Communication',
    'App Experience',
    'General Feedback'
  ];

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!sentiment || !feedbackText || rating === 0 || !category) {
      toast({
        title: "Incomplete Feedback",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await mobileApiService.submitFeedback({
        sentiment,
        feedbackText,
        rating,
        category,
        employeeId: authState.user?.employeeId || ''
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your valuable feedback!"
      });

      // Reset form
      setFeedbackText('');
      setSentiment('');
      setRating(0);
      setCategory('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout title="Share Feedback" bgColor="bg-blue-600">
      <div className="p-4 space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-xl font-bold mb-2">Your Voice Matters</h2>
            <p className="opacity-90">Help us improve by sharing your experience</p>
          </CardContent>
        </Card>

        {/* Rating Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rate your overall experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-2">
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
              <p className="text-sm text-gray-600 mt-2 text-center">
                You rated: {rating} star{rating !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={sentiment} onValueChange={setSentiment}>
              <div className="space-y-3">
                {sentimentOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feedback Category</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={category} onValueChange={setCategory}>
              <div className="grid grid-cols-2 gap-2">
                {categoryOptions.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <RadioGroupItem value={cat} id={cat} />
                    <Label htmlFor={cat} className="cursor-pointer text-sm">{cat}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
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
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-32"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !sentiment || !feedbackText || rating === 0 || !category}
          className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Submit Feedback</span>
            </div>
          )}
        </Button>
      </div>
    </MobileLayout>
  );
};

export default MobileFeedback;
