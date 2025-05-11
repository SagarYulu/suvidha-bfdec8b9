
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Explicitly defined dashboard user roles that should be redirected to admin dashboard
  const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
  
  // Explicitly defined dashboard user emails that should never access mobile app
  const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      console.log("Attempting mobile login with:", { email });
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful, checking access rights");
        
        // Get user data from localStorage - could be from mockUser or yuluUser
        const userDataString = localStorage.getItem("mockUser");
        
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log("User data found:", userData);
          
          // Check if user email is explicitly restricted
          if (restrictedEmails.includes(userData.email)) {
            console.log("Restricted email detected:", userData.email);
            setError("Access denied. Please use the admin dashboard login.");
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            await logout();
            setIsLoading(false);
            return;
          }
          
          // Check if user has a dashboard role
          if (userData.role && dashboardUserRoles.includes(userData.role)) {
            console.log("Dashboard role detected:", userData.role);
            setError("Access denied. Please use the admin dashboard login.");
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            await logout();
            setIsLoading(false);
            return;
          }
          
          // All other users (including those from employee table) should be allowed access
          console.log("User has mobile app access, redirecting to tickets");
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          navigate("/mobile/issues");
        } else {
          // If we can't determine the user type, assume they're a regular employee
          console.log("No user data found in localStorage, checking auth state");
          
          // Try to get user from auth state
          const authState = JSON.parse(localStorage.getItem("authState") || "{}");
          if (authState && authState.user) {
            console.log("Found user in auth state:", authState.user);
            
            // Double check restricted emails
            if (authState.user.email && restrictedEmails.includes(authState.user.email)) {
              console.log("Restricted email detected in auth state:", authState.user.email);
              setError("Access denied. Please use the admin dashboard login.");
              toast({
                title: "Access Denied",
                description: "You don't have access to the mobile app. Please use the admin dashboard.",
                variant: "destructive",
              });
              await logout();
              setIsLoading(false);
              return;
            }
            
            // Double check dashboard roles
            if (authState.role && dashboardUserRoles.includes(authState.role)) {
              console.log("Dashboard role detected in auth state:", authState.role);
              setError("Access denied. Please use the admin dashboard login.");
              toast({
                title: "Access Denied",
                description: "You don't have access to the mobile app. Please use the admin dashboard.",
                variant: "destructive",
              });
              await logout();
              setIsLoading(false);
              return;
            }
            
            // If no restrictions found, allow access
            console.log("User has mobile app access through auth state, redirecting to tickets");
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
            navigate("/mobile/issues");
          } else {
            // No user data found anywhere, but login was successful
            console.log("No user data found, assuming regular employee");
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
            navigate("/mobile/issues");
          }
        }
      } else {
        console.log("Login failed");
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyan-100">
      {/* Header/Banner Image */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div 
            className="w-full h-64 mb-8 bg-cover bg-center rounded-lg relative overflow-hidden"
            style={{ 
              backgroundImage: `url('/lovable-uploads/3ede46b1-32ef-4aec-a501-b8c3b488b24c.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-cyan-500 bg-opacity-50"></div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-t-3xl px-6 pt-6 pb-8 shadow-lg -mt-12 relative z-10">
            <h1 className="text-2xl font-bold text-center text-cyan-700 mb-6">
              Yulu Suvidha
            </h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-cyan-500" />
                </div>
                <Input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 text-base py-3"
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 text-base py-3"
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full py-6 text-lg font-medium rounded-full",
                  "bg-cyan-500 hover:bg-cyan-600 text-white"
                )}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">
                For employee login, use your employee email and password
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <a href="/" className="text-cyan-600 hover:underline text-sm">
                  Back to Home
                </a>
                <span className="text-gray-300">|</span>
                <a href="/admin/login" className="text-cyan-600 hover:underline text-sm">
                  Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
