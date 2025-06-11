
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userRole: string;
  city: string;
  cluster: string;
  createdAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
}

interface RecentFeedbackProps {
  feedback: FeedbackItem[];
  isLoading?: boolean;
  limit?: number;
}

const RecentFeedback: React.FC<RecentFeedbackProps> = ({
  feedback,
  isLoading = false,
  limit = 10
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayFeedback = feedback.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Feedback ({feedback.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent feedback available
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {displayFeedback.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                {/* Header with rating and time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderStars(item.rating)}
                    <Badge className={getSentimentColor(item.sentiment)}>
                      {item.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </div>
                </div>

                {/* Comment */}
                {item.comment && (
                  <p className="text-gray-700 text-sm italic">
                    "{item.comment}"
                  </p>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* User info and location */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>{item.userName}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.userRole}
                    </Badge>
                  </div>
                  <div className="text-xs">
                    {item.city} - {item.cluster}
                  </div>
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
