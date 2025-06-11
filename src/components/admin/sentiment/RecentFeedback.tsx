
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Clock } from 'lucide-react';
import { SentimentEntry } from '@/services/sentimentService';

interface RecentFeedbackProps {
  feedbackData: SentimentEntry[];
  isLoading?: boolean;
  limit?: number;
}

const RecentFeedback: React.FC<RecentFeedbackProps> = ({ 
  feedbackData, 
  isLoading = false, 
  limit = 10 
}) => {
  const recentFeedback = feedbackData.slice(0, limit);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'neutral': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
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
          Recent Feedback ({recentFeedback.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent feedback available</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentFeedback.map((entry) => (
              <div key={entry.id} className="border-l-4 border-blue-200 pl-4 py-3 bg-gray-50 rounded-r">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {entry.employee_name || 'Anonymous'}
                    </span>
                    {entry.sentiment_label && (
                      <Badge className={`text-white text-xs ${getSentimentColor(entry.sentiment_label)}`}>
                        {entry.sentiment_label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDate(entry.createdAt)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {renderStars(entry.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {entry.rating}/5
                  </span>
                </div>
                
                {entry.feedback_text && (
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {entry.feedback_text}
                  </p>
                )}
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  {entry.city && <span>📍 {entry.city}</span>}
                  {entry.cluster && <span>🏢 {entry.cluster}</span>}
                  {entry.role && <span>👤 {entry.role}</span>}
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
