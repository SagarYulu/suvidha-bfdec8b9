
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FeedbackAnalytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Feedback Analytics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Feedback Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Feedback analytics will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackAnalytics;
