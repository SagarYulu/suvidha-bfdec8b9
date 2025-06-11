
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to admin dashboard if already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Yulu Suvidha</h1>
          <p className="text-lg text-gray-600">Issue Management System</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Access the admin panel to manage issues, users, and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin/login')} 
                className="w-full"
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mobile Access</CardTitle>
              <CardDescription>
                Mobile-friendly interface for employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/mobile/login')} 
                variant="outline" 
                className="w-full"
              >
                Mobile Login
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Migration</CardTitle>
              <CardDescription>
                Import data from existing systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/data-migration')} 
                variant="secondary" 
                className="w-full"
              >
                Data Migration Tool
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
