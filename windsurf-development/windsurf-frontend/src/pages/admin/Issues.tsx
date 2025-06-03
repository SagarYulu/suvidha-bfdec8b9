
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Issues = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Issues Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Issues list will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Issues;
