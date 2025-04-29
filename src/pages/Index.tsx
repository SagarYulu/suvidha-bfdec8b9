
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  useEffect(() => {
    // If already logged in, show welcoming toast
    if (authState.isAuthenticated) {
      toast({
        title: "Welcome back!",
        description: `You are logged in as ${authState.user?.name}`,
      });
      console.log("User is authenticated:", authState.user);
    }
  }, [authState]);

  const handleAdminClick = () => {
    console.log("Admin button clicked, current auth state:", authState);
    
    // If the user is already authenticated and has an admin role, navigate directly
    if (authState.isAuthenticated && 
        (authState.role === "hr_admin" || authState.role === "city_head" || authState.role === "ops")) {
      console.log("User is admin, navigating to dashboard");
      navigate("/admin/dashboard");
    } else {
      // For demo purposes, navigate to mobile login
      console.log("User is not admin or not authenticated, navigating to mobile login");
      navigate("/mobile/login");
    }
  };

  const handleEmployeeClick = () => {
    console.log("Employee button clicked, current auth state:", authState);
    
    // If the user is already authenticated and is an employee, navigate directly
    if (authState.isAuthenticated && authState.role === "employee") {
      console.log("User is employee, navigating to mobile issues");
      navigate("/mobile/issues");
    } else {
      // For demo purposes, navigate to mobile login with employee credentials prefilled
      console.log("User is not employee or not authenticated, navigating to mobile login");
      navigate("/mobile/login");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-yulu-blue p-8">
          <h1 className="text-4xl font-bold text-white text-center">Yulu Issue Resolver</h1>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-center">Welcome</h2>
            <p className="text-gray-600 text-center">
              Choose which application you want to access
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleAdminClick}
              className="py-6 bg-yulu-blue hover:bg-blue-700"
            >
              Admin Dashboard
            </Button>
            <Button 
              onClick={handleEmployeeClick}
              variant="outline"
              className="py-6 border-2 border-yulu-blue text-yulu-blue hover:bg-gray-100"
            >
              Employee Mobile App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
