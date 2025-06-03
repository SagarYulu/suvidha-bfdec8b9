
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssignedIssues = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Assigned Issues</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Assigned issues will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedIssues;
