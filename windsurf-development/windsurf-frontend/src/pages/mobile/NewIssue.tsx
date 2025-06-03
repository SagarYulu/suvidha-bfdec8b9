
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewIssue = () => {
  return (
    <div className="min-h-screen bg-[#1E40AF]/10 p-4">
      <div className="bg-[#1E40AF] h-32 w-full rounded-lg mb-4 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">Raise Ticket</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">New issue creation form will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewIssue;
