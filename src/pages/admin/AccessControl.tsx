
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";

const AccessControl = () => {
  return (
    <AdminLayout title="Access Control">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Access Control</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Access control settings will be displayed here</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AccessControl;
