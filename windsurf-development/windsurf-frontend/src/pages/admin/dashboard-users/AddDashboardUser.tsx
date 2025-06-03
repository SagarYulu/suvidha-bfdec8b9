
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AddDashboardUser = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Dashboard User</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Dashboard User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User creation form will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDashboardUser;
