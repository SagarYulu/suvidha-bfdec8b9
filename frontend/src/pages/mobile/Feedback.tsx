
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smile, Meh, Frown } from 'lucide-react';
import { IssueService } from '@/services/issueService';
import { toast } from 'sonner';

const FEEDBACK_OPTIONS = {
  happy: [
    'Quick resolution',
    'Helpful support',
    'Clear communication',
    'Professional service'
  ],
  neutral: [
    'Average response time',
    'Standard service',
    'Could be better',
    'Met expectations'
  ],
  sad: [
    'Slow response',
    'Poor communication',
    'Unresolved issue',
    'Unsatisfactory service'
  ]
};

export default function Feedback() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const [selectedSentiment, setSelectedSentiment] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSentiment || !selectedOption || !issueId) {
      toast.error('Please select your feedback');
      return;
    }

    try {
      setSubmitting(true);
      await IssueService.submitFeedback(issueId, {
        sentiment: selectedSentiment,
        feedbackOption: selectedOption
      });
      toast.success('Thank you for your feedback!');
      navigate('/mobile/issues');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const sentimentOptions = [
    {
      value: 'happy' as const,
      icon: Smile,
      label: 'Happy',
      color: 'bg-green-100 text-green-700 border-green-200',
      activeColor: 'bg-green-500 text-white'
    },
    {
      value: 'neutral' as const,
      icon: Meh,
      label: 'Neutral',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      activeColor: 'bg-yellow-500 text-white'
    },
    {
      value: 'sad' as const,
      icon: Frown,
      label: 'Sad',
      color: 'bg-red-100 text-red-700 border-red-200',
      activeColor: 'bg-red-500 text-white'
    }
  ];

  return (
    <MobileLayout title="Feedback" bgColor="bg-purple-600">
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">How was your experience?</h2>
          <p className="text-gray-600">Your feedback helps us improve our service</p>
        </div>

        {/* Sentiment Selection */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Rate your experience</h3>
            <div className="grid grid-cols-3 gap-3">
              {sentimentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedSentiment === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedSentiment(option.value);
                      setSelectedOption(''); // Reset option when changing sentiment
                    }}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center
                      ${isSelected ? option.activeColor : option.color}
                      hover:scale-105
                    `}
                  >
                    <Icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Options */}
        {selectedSentiment && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Tell us more</h3>
              <div className="space-y-2">
                {FEEDBACK_OPTIONS[selectedSentiment].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={`
                      w-full p-3 text-left rounded-lg border transition-all duration-200
                      ${selectedOption === option
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!selectedSentiment || !selectedOption || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/mobile/issues')}
            className="w-full"
          >
            Skip Feedback
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
