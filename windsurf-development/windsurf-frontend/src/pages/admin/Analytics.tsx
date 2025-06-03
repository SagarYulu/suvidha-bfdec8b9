
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Analytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics charts and reports will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
