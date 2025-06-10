
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IssueDetails = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Issue Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Issue #{id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Issue details will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetails;
