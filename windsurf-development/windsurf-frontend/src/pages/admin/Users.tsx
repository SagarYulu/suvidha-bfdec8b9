
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Users = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Users list will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
