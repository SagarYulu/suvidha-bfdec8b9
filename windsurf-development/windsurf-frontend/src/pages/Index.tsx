
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E40AF] p-8">
          <h1 className="text-4xl font-bold text-white text-center">Windsurf Management</h1>
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
              className="py-6 bg-[#1E40AF] hover:bg-blue-700"
            >
              Admin Dashboard
            </Button>
            <Button 
              onClick={handleEmployeeClick}
              variant="outline"
              className="py-6 border-2 border-[#1E40AF] text-[#1E40AF] hover:bg-gray-100"
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
