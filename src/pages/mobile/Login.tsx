
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MobileLogin = () => {
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState, login, logout } = useAuth();
  const navigate = useNavigate();
  const initialCheckDone = useRef(false);

  // Dashboard user roles that should be redirected to admin dashboard
  const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
  
  // Restricted emails that should never access mobile app
  const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];

  // Check auth only once on component mount with improved loading state
  useEffect(() => {
    if (initialCheckDone.current) {
      return; // Skip if we've already checked
    }
    
    // Add a short timeout to allow UI to render before checking auth
    const timer = setTimeout(() => {
      // Mark that we've done the initial check
      initialCheckDone.current = true;
      
      const checkExistingAuth = () => {
        if (authState && authState.isAuthenticated && authState.user) {
          console.log("User already authenticated, checking access rights");
          
          // Check if user email is explicitly restricted
          if (restrictedEmails.includes(authState.user.email)) {
            console.log("Restricted email detected:", authState.user.email);
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            logout();
            setPageLoading(false);
            return;
          }
          
          // Check if user has a dashboard role
          if (authState.role && dashboardUserRoles.includes(authState.role)) {
            console.log("Dashboard role detected:", authState.role);
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            logout();
            setPageLoading(false);
            return;
          }
          
          // If no restrictions, redirect to mobile issues
          navigate("/mobile/issues", { replace: true });
        } else {
          // Not authenticated, just show login form
          setPageLoading(false);
        }
      };
      
      checkExistingAuth();
    }, 300); // Small delay for better UI experience
    
    return () => clearTimeout(timer);
  }, [authState, navigate, logout]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); 

    try {
      console.log("Attempting mobile verification with:", { email, employeeId });
      // Use employeeId as password for authentication
      const loginResult = await login(email, employeeId);
      
      if (loginResult === true) {
        console.log("Verification successful, checking access rights");
        
        // Get user data from localStorage - could be from mockUser or auth state
        const authStateData = localStorage.getItem("authState");
        const userData = authStateData ? JSON.parse(authStateData) : null;
        
        if (userData && userData.user) {
          // Check if user email is explicitly restricted
          if (restrictedEmails.includes(userData.user.email)) {
            console.log("Restricted email detected:", userData.user.email);
            setError("Access denied. Please use the admin dashboard login.");
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            logout();
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
            logout();
            setIsLoading(false);
            return;
          }
          
          // Success - user has mobile app access
          console.log("User has mobile app access, redirecting to issues");
          toast({
            title: "Verification successful",
            description: "Welcome back!",
          });
          navigate("/mobile/issues", { replace: true });
        } else {
          // If verification succeeded but no user data found
          console.log("No user data found, assuming regular employee");
          toast({
            title: "Verification successful",
            description: "Welcome back!",
          });
          navigate("/mobile/issues", { replace: true });
        }
      } else {
        console.log("Verification failed");
        setError("Invalid email or employee ID. Please try again.");
        toast({
          title: "Verification failed",
          description: "Invalid email or employee ID. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Verification error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#1E40AF]/10">
        <div className="bg-[#1E40AF] h-[40vh] w-full"></div>
        <div className="relative px-6 mx-auto max-w-md -mt-32">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 py-10">
              <Skeleton className="h-10 w-48 mx-auto mb-10" />
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <Skeleton className="h-12 w-full mt-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E40AF]/10">
      {/* Full-width curved blue background */}
      <div className="bg-[#1E40AF] h-[40vh] w-full"></div>

      {/* Card positioned over the background */}
      <div className="relative px-6 mx-auto max-w-md -mt-32">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-center text-[#1E40AF] mb-10">
              Yulu Suvidha
            </h1>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-8">
              {/* Email input with label */}
              <div className="space-y-2">
                <label className="text-gray-500 text-sm font-medium ml-1">Email ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-[#1E40AF]" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 
                              focus:border-[#1E40AF] text-base py-2 mobile-input"
                  />
                </div>
              </div>

              {/* Employee ID input with label */}
              <div className="space-y-2">
                <label className="text-gray-500 text-sm font-medium ml-1">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-[#1E40AF]" />
                  </div>
                  <Input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="pl-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 
                              focus:border-[#1E40AF] text-base py-2 mobile-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg font-medium rounded-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white mt-8"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Use your employee email and employee ID
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
