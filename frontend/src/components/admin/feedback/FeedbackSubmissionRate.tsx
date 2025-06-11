
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Users } from 'lucide-react';

interface FeedbackSubmissionRateProps {
  totalFeedback: number;
  totalClosedTickets: number;
  submissionRate: number;
}

const FeedbackSubmissionRate: React.FC<FeedbackSubmissionRateProps> = ({
  totalFeedback,
  totalClosedTickets,
  submissionRate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback Submission Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {submissionRate.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">
            of closed tickets received feedback
          </p>
        </div>

        <Progress value={submissionRate} className="h-3" />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600">Feedback</span>
            </div>
            <div className="text-lg font-semibold">{totalFeedback}</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">Closed Tickets</span>
            </div>
            <div className="text-lg font-semibold">{totalClosedTickets}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
