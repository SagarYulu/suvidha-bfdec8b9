
import { useState } from 'react';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Smile, Meh, Frown } from 'lucide-react';
import { toast } from 'sonner';

export default function Feedback() {
  const [sentiment, setSentiment] = useState<'happy' | 'neutral' | 'sad'>('neutral');
  const [feedbackOption, setFeedbackOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sentimentOptions = [
    { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-500' },
    { value: 'sad', label: 'Sad', icon: Frown, color: 'text-red-500' }
  ];

  const feedbackOptions = [
    'App is working great',
    'Quick resolution',
    'Helpful support team',
    'Easy to use interface',
    'App needs improvement',
    'Response time is slow',
    'Interface is confusing',
    'Technical issues',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackOption) {
      toast.error('Please select a feedback option');
      return;
    }

    try {
      setIsSubmitting(true);
      // Submit feedback logic would go here
      console.log('Submitting feedback:', { sentiment, feedbackOption });
      toast.success('Feedback submitted successfully');
      
      // Reset form
      setSentiment('neutral');
      setFeedbackOption('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout title="Feedback">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Share Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sentiment Selection */}
              <div>
                <Label className="text-base font-medium mb-4 block">How are you feeling?</Label>
                <div className="flex justify-center space-x-8">
                  {sentimentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = sentiment === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSentiment(option.value as any)}
                        className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-8 w-8 ${isSelected ? 'text-blue-500' : option.color}`} />
                        <span className={`mt-2 text-sm font-medium ${
                          isSelected ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Options */}
              <div>
                <Label className="text-base font-medium mb-4 block">Select feedback option</Label>
                <RadioGroup value={feedbackOption} onValueChange={setFeedbackOption}>
                  <div className="space-y-3">
                    {feedbackOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !feedbackOption}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
