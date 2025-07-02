
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock } from 'lucide-react';

interface FeedbackItem {
  id: string;
  content: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  employeeName: string;
  createdAt: string;
  rating: number;
}

interface RecentFeedbackProps {
  feedback: FeedbackItem[];
  isLoading?: boolean;
}

const RecentFeedback: React.FC<RecentFeedbackProps> = ({
  feedback,
  isLoading = false
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'happy': return 'bg-green-100 text-green-800';
      case 'sad': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No recent feedback available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getSentimentColor(item.sentiment)}>
                      {item.sentiment}
                    </Badge>
                    <span className="text-sm font-medium">{item.employeeName}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{item.content}</p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Rating: {item.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFeedback;
