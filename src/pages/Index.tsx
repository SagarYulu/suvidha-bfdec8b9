
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { authState, refreshAuth } = useAuth();
  
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);
  
  useEffect(() => {
    if (authState.isAuthenticated) {
      toast({
        title: "Welcome back!",
        description: `You are logged in as ${authState.user?.name}`,
      });
    }
  }, [authState]);

  const handleAdminClick = () => {
    if (authState.isAuthenticated && (authState.role === "admin" || authState.role === "Super Admin")) {
      navigate("/admin/dashboard");
    } else {
      navigate("/admin/login");
    }
  };

  const handleEmployeeClick = () => {
    if (authState.isAuthenticated && authState.role === "employee") {
      navigate("/mobile/issues");
    } else {
      navigate("/mobile/login");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
          <h1 className="text-4xl font-bold text-white text-center">Yulu Suvidha</h1>
          <p className="text-blue-100 text-center mt-2">Grievance Management System</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-center text-gray-800">Welcome</h2>
            <p className="text-gray-600 text-center">
              Choose your portal to access the system
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleAdminClick}
              className="py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg">Admin Dashboard</span>
                <span className="text-xs opacity-90">For administrators & managers</span>
              </div>
            </Button>
            <Button 
              onClick={handleEmployeeClick}
              variant="outline"
              className="py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg">Employee Portal</span>
                <span className="text-xs opacity-70">For employees & mobile access</span>
              </div>
            </Button>
          </div>
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
