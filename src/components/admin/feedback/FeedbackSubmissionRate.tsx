
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle, MessageSquare } from 'lucide-react';

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
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Feedback Submission Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Rate</span>
            <span className="text-2xl font-bold">{submissionRate.toFixed(1)}%</span>
          </div>
          
          <Progress value={submissionRate} className="w-full" />
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Feedback Received</p>
                <p className="font-semibold">{totalFeedback.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Tickets Closed</p>
                <p className="font-semibold">{totalClosedTickets.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
