
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  useEffect(() => {
    // If already logged in, show welcoming toast
    if (isAuthenticated && user) {
      toast.success(`Welcome back, ${user.name}!`);
    }
  }, [isAuthenticated, user]);

  const handleAdminClick = () => {
    // If the user is already authenticated and is an admin, navigate directly
    if (isAuthenticated && (user?.role === "admin" || user?.role === "security-admin")) {
      navigate("/admin/dashboard");
    } else {
      // Not authenticated or not admin - redirect to admin login page
      navigate("/admin/login");
    }
  };

  const handleEmployeeClick = () => {
    // If the user is already authenticated and is an employee, navigate directly
    if (isAuthenticated && user?.role === "employee") {
      navigate("/mobile/issues");
    } else {
      // Not authenticated or not employee - redirect to login
      navigate("/mobile/login");
    }
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    if (!isPresentationMode) {
      toast.success("Presentation mode activated", {
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
        <div className="bg-blue-600 p-8">
          <h1 className="text-4xl font-bold text-white text-center">Windsurf Development</h1>
          <p className="text-blue-100 text-center mt-2">Issue Management System</p>
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
              className="py-6 bg-blue-600 hover:bg-blue-700"
            >
              Admin Dashboard
            </Button>
            <Button 
              onClick={handleEmployeeClick}
              variant="outline"
              className="py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Employee Mobile App
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
