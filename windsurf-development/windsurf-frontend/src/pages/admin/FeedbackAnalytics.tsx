
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";

const FeedbackAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['feedback-analytics'],
    queryFn: () => apiService.getFeedbackAnalytics(),
  });

  return (
    <AdminLayout title="Feedback Analytics">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Feedback Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? 'Loading...' : (analytics?.total || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? 'Loading...' : (analytics?.avgRating || 0).toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? 'Loading...' : `${analytics?.responseRate || 0}%`}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading feedback data...</p>
            ) : (
              <p className="text-muted-foreground">Detailed feedback analytics will be displayed here</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FeedbackAnalytics;
