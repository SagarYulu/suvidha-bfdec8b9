
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

  // Admin roles that should NOT access mobile app
  const adminRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
  const adminEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];

  useEffect(() => {
    if (initialCheckDone.current) return;
    
    const timer = setTimeout(() => {
      initialCheckDone.current = true;
      
      const checkExistingAuth = () => {
        if (authState && authState.isAuthenticated && authState.user) {
          console.log("User already authenticated, checking mobile app access rights");
          
          const isAdminEmail = adminEmails.includes(authState.user.email);
          const isAdminRole = authState.role && adminRoles.includes(authState.role);
          
          if (isAdminEmail || isAdminRole) {
            console.log("Admin user detected:", authState.user.email, "role:", authState.role);
            toast({
              title: "Access Denied",
              description: "Admin users cannot access the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            logout();
            setPageLoading(false);
            return;
          }
          
          // Regular employee - allow access
          navigate("/mobile/issues", { replace: true });
        } else {
          setPageLoading(false);
        }
      };
      
      checkExistingAuth();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [authState, navigate, logout]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); 

    try {
      console.log("Attempting mobile verification with:", { email, employeeId });
      const success = await login({ email, password: employeeId });
      
      if (success) {
        console.log("Verification successful, checking mobile app access rights");
        
        const authStateData = localStorage.getItem("authState");
        const userData = authStateData ? JSON.parse(authStateData) : null;
        
        if (userData && userData.user) {
          const isAdminEmail = adminEmails.includes(userData.user.email);
          const isAdminRole = userData.role && adminRoles.includes(userData.role);
          
          if (isAdminEmail || isAdminRole) {
            console.log("Admin user detected:", userData.user.email, "role:", userData.role);
            setError("Access denied. Admin users should use the dashboard login at /admin/login");
            toast({
              title: "Access Denied",
              description: "Admin users cannot access the mobile app. Please use the admin dashboard at /admin/login",
              variant: "destructive",
            });
            await logout();
            setIsLoading(false);
            return;
          }
          
          // Regular employee - allow access
          console.log("Regular employee has mobile app access, redirecting to issues");
          toast({
            title: "Verification successful",
            description: "Welcome back!",
          });
          navigate("/mobile/issues", { replace: true });
        } else {
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
      <div className="bg-[#1E40AF] h-[40vh] w-full"></div>

      <div className="relative px-6 mx-auto max-w-md -mt-32">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-center text-[#1E40AF] mb-10">
              Yulu Employee App
            </h1>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-8">
              <div className="space-y-2">
                <label className="text-gray-500 text-sm font-medium ml-1">Employee Email</label>
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
              <p className="text-sm text-gray-500 mb-2">
                For employees only
              </p>
              <a href="/admin/login" className="text-sm text-blue-600 hover:underline">
                Admin? Go to Dashboard Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
