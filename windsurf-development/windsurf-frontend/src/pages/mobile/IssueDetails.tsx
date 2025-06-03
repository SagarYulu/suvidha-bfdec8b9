
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MobileIssueDetails = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[#1E40AF]/10 p-4">
      <div className="bg-[#1E40AF] h-32 w-full rounded-lg mb-4 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">Issue Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Issue #{id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Mobile issue details will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileIssueDetails;
