
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MobileIssues = () => {
  return (
    <div className="min-h-screen bg-[#1E40AF]/10 p-4">
      <div className="bg-[#1E40AF] h-32 w-full rounded-lg mb-4 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">My Issues</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your issues list will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileIssues;
