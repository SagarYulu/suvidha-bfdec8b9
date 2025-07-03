
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const navigate = useNavigate();
  const { authState, refreshAuth } = useAuth();
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  useEffect(() => {
    // Try to refresh auth on load
    const checkAuth = async () => {
      await refreshAuth();
    };
    
    checkAuth();
  }, [refreshAuth]);
  
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

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    if (!isPresentationMode) {
      toast({
        title: "Presentation mode activated",
        description: "Press P key to exit presentation mode",
      });
    }
  };

  // Event listener for P key to toggle presentation mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') {
        togglePresentationMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPresentationMode]);
  
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
      
      {!isPresentationMode && (
        <Alert className="fixed bottom-4 right-4 max-w-md shadow-lg border border-gray-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Press the <strong>P</strong> key to enter presentation mode and hide this message box.
          </AlertDescription>
        </Alert>
      )}
      
      {/* This div will cover the chat interface when in presentation mode */}
      {isPresentationMode && (
        <div 
          className="fixed top-0 left-0 w-1/2 h-full bg-white z-50"
          onClick={togglePresentationMode}
        >
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-xl p-4 text-center">
              Presentation Mode<br/>
              Click anywhere or press P to exit
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
