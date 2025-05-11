import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, MailIcon } from "lucide-react";
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
    <div className="min-h-screen bg-[#E6F8FA]">
      {/* Full-width curved cyan background */}
      <div className="bg-gradient-to-b from-[#00B6CB] to-[#00C7DE] h-[45vh] rounded-b-[40px] w-full"></div>

      {/* Card positioned over the background */}
      <div className="relative px-6 mx-auto max-w-md -mt-28">
        <div className="bg-white rounded-[25px] shadow-lg overflow-hidden">
          <div className="px-8 py-10">
            <h1 className="text-2xl font-bold text-center text-[#00B6CB] mb-8">
              Yulu Suvidha
            </h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-7">
              {/* Email input with label */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-medium ml-1">Email ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-[#00B6CB]" />
                  </div>
                  <Input
                    type="email"
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 focus:border-[#00B6CB] text-base py-2"
                  />
                </div>
              </div>

              {/* Password input with label */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-medium ml-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 focus:border-[#00B6CB] text-base py-2"
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
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full py-5 text-lg font-medium rounded-full mt-8",
                  "bg-[#00B6CB] hover:bg-[#00A3B7] text-white"
                )}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-5">
                For employee login, use your employee email and password
              </p>
              <div className="flex justify-center space-x-6 pt-2">
                <a href="/" className="text-[#00B6CB] hover:underline text-sm">
                  Back to Home
                </a>
                <span className="text-gray-300">|</span>
                <a href="/admin/login" className="text-[#00B6CB] hover:underline text-sm">
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
