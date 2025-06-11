
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';

const FeedbackAnalytics: React.FC = () => {
  return (
    <AdminLayout title="Feedback Analytics">
      <div className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">+0.3 from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,847</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${rating === 5 ? 45 : rating === 4 ? 30 : rating === 3 ? 15 : rating === 2 ? 7 : 3}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {rating === 5 ? '45%' : rating === 4 ? '30%' : rating === 3 ? '15%' : rating === 2 ? '7%' : '3%'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">John Doe</span>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                    <span className="ml-2 text-sm">Issue ID: #1234</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Great support! My salary issue was resolved quickly.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-400 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Jane Smith</span>
                    <span className="text-sm text-gray-500">5 hours ago</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400">⭐⭐⭐⭐</span>
                    <span className="ml-2 text-sm">Issue ID: #1235</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Good service, but took a bit longer than expected.
                  </p>
                </div>
                
                <div className="border-l-4 border-yellow-400 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mike Johnson</span>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400">⭐⭐⭐</span>
                    <span className="ml-2 text-sm">Issue ID: #1236</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Average experience. Could be improved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeedbackAnalytics;
