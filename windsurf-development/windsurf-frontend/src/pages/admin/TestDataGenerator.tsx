
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestDataGenerator = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test Data Generator</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Test Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Test data generation tools will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDataGenerator;
