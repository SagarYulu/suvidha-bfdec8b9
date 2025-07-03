
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Download } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { authState, refreshAuth } = useAuth();

  
  useEffect(() => {
    // Try to refresh auth on load
    const checkAuth = async () => {
      await refreshAuth();
    };
    
    checkAuth();
  }, [refreshAuth]);
  
  // Removed welcome toast as it was showing repeatedly
  useEffect(() => {
    if (authState.isAuthenticated) {
      console.log("User is authenticated:", authState.user);
    }
  }, [authState]);

  const handleAdminClick = () => {
    console.log("Admin button clicked, current auth state:", authState);
    
    // If the user is already authenticated and is an admin or security-admin, navigate directly
    if (authState.isAuthenticated && (authState.role === "admin" || authState.role === "security-admin")) {
      console.log("User is admin/security-admin, navigating to dashboard");
      navigate("/admin/dashboard");
    } else {
      // Not authenticated or not admin - redirect to admin login page
      console.log("User is not admin or not authenticated, navigating to admin login");
      navigate("/admin/login");
    }
  };

  const handleEmployeeClick = () => {
    console.log("Employee button clicked, current auth state:", authState);
    
    // If the user is already authenticated and is an employee, navigate directly
    if (authState.isAuthenticated && authState.role === "employee") {
      console.log("User is employee, navigating to mobile issues");
      navigate("/mobile/issues");
    } else {
      // Not authenticated or not employee - redirect to login
      console.log("User is not employee or not authenticated, navigating to mobile login");
      navigate("/mobile/login");
    }
  };

  const handleExportClick = () => {
    navigate("/export");
  };

  // Removed presentation mode functionality
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
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
              className="py-6 bg-yulu-blue hover:bg-yulu-blue-dark text-white font-medium"
            >
              Admin Dashboard
            </Button>
            <Button 
              onClick={handleEmployeeClick}
              variant="outline"
              className="py-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Employee Mobile App
            </Button>
            <Button 
              onClick={handleExportClick}
              variant="outline"
              className="py-6 border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Database
            </Button>
          </div>
        </div>
      </div>
      
      {/* Removed presentation mode UI */}
    </div>
  );
};

export default Index;
