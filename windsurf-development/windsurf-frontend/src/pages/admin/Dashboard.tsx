
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Total tickets raised</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">0% resolution rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Average Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 hrs</div>
            <p className="text-sm text-muted-foreground">Working hours (9AM-5PM, Mon-Sat)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>First Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 hrs</div>
            <p className="text-sm text-muted-foreground">Average working hours to first response</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
