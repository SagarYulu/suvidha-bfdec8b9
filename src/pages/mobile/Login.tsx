
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { AlertCircle, TicketCheck } from "lucide-react";

const MobileLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      console.log("Attempting mobile login with:", { email });
      const success = await login(email, password);
      
      if (success) {
        // Get user data to check role
        const userDataString = localStorage.getItem("yuluUser") || localStorage.getItem("mockUser");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log("User data after login:", userData);
          
          // Define dashboard user roles that should be rejected
          const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
          
          // ONLY reject if the user is specifically one of the two admin emails
          // All other users including employees added via user management should be allowed
          if (userData.email === 'sagar.km@yulu.bike' || userData.email === 'admin@yulu.com') {
            console.log("Admin email detected, rejecting mobile access");
            setError("Access denied. Please use the admin dashboard login.");
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            // Log them out immediately
            await logout();
            setIsLoading(false);
            return;
          }
          
          // Check if user has a dashboard role - these users should use admin dashboard
          if (userData.role && dashboardUserRoles.includes(userData.role)) {
            console.log("Dashboard role detected, rejecting mobile access:", userData.role);
            setError("Access denied. Please use the admin dashboard login.");
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            // Log them out immediately
            await logout();
            setIsLoading(false);
            return;
          }
          
          // For regular employees, allow login and redirect to mobile tickets
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          console.log("Employee login successful, redirecting to mobile tickets");
          navigate("/mobile/issues");
        } else {
          // Default to mobile tickets if no user data found
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          navigate("/mobile/issues");
        }
      } else {
        setError("Invalid email or password. Please try again.");
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yulu-blue">Yulu Employee App</h1>
            <p className="text-gray-600 mt-2">Sign in to manage your tickets</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email" 
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-yulu-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>For employee login, use your employee email and password</p>
            <div className="flex items-center justify-center mt-4 text-yulu-blue">
              <TicketCheck className="h-4 w-4 mr-1" />
              <span>Raise and track tickets easily</span>
            </div>
            <p className="mt-2">
              <a href="/" className="text-yulu-blue hover:underline">
                Back to Home
              </a>
            </p>
            <p className="mt-2">
              <a href="/admin/login" className="text-yulu-blue hover:underline">
                Go to Admin Dashboard Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
