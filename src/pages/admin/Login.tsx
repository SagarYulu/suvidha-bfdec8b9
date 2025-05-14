import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from "@/integrations/supabase/client";

interface LocationState {
  returnTo?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authState, signIn, refreshAuth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { returnTo } = (location.state as LocationState) || {};
  const initialCheckDone = useRef(false);

  // Check auth only once on component mount, with no auto redirects on state changes
  useEffect(() => {
    const checkInitialAuth = () => {
      if (initialCheckDone.current) {
        return; // Skip if we've already checked
      }
      
      // Mark that we've done the initial check
      initialCheckDone.current = true;
      
      // Only redirect on initial render if already logged in
      if (authState.isAuthenticated && authState.role) {
        // Define dashboard roles
        const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
        
        // Only redirect if user has a dashboard role
        if (dashboardUserRoles.includes(authState.role) || authState.user?.email === 'sagar.km@yulu.bike' || authState.user?.email === 'admin@yulu.com') {
          console.log("Admin user already authenticated, redirecting to:", returnTo || '/admin/dashboard');
          navigate(returnTo || '/admin/dashboard', { replace: true });
        } else {
          // If logged in but not an admin user, show error and log them out
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
          logout();
        }
      }
    };
    
    // Only run once on mount
    checkInitialAuth();
  }, []); // Intentionally empty dependency array to run only once

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log("Attempting to login to admin dashboard with:", email);
      
      // Before attempting to login, check if these are demo credentials
      // and try to get the actual UUID from the database
      if (email === 'admin@yulu.com' && password === 'admin123') {
        
        // Look up actual user in dashboard_users table
        console.log("Demo credential detected, checking for actual user record");
        
        try {
          const { data: dashboardUser, error } = await supabase
            .from('dashboard_users')
            .select('*')
            .eq('email', email.toLowerCase())
            .maybeSingle();
          
          if (!error && dashboardUser) {
            console.log("Found actual dashboard user record:", dashboardUser.id);
            // We'll let the login process continue, and the auth service will handle this
          } else {
            console.log("No matching dashboard user found in database");
          }
        } catch (e) {
          console.error("Error checking dashboard users:", e);
        }
      }
      
      // Try login through authContext
      const success = await signIn(email, password);
      
      if (success) {
        // Ensure auth state is refreshed
        await refreshAuth();
        
        // Get updated user data
        const userDataString = localStorage.getItem("mockUser");
        const userData = userDataString ? JSON.parse(userDataString) : null;
        
        // Define dashboard roles
        const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
        
        // Check if user has permission to access admin dashboard
        const isAdmin = userData?.role && dashboardUserRoles.includes(userData.role);
        const isSpecialAdmin = userData?.email === 'sagar.km@yulu.bike' || userData?.email === 'admin@yulu.com';
        
        if (isAdmin || isSpecialAdmin) {
          toast({
            description: 'Login successful!'
          });
          
          // Redirect to the return URL if provided, or to the dashboard
          const redirectPath = returnTo || '/admin/dashboard';
          console.log("Admin login successful, redirecting to:", redirectPath);
          navigate(redirectPath, { replace: true });
        } else {
          // This is an employee trying to log into the admin dashboard - reject
          setErrorMessage("Access denied. You don't have permission to access the admin dashboard.");
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard. Please use the employee app.",
            variant: "destructive",
          });
          // Log them out immediately
          await logout();
        }
      } else {
        setErrorMessage('Invalid email or password');
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'An error occurred during login');
      toast({
        title: "Login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Yulu Suvidha Management</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
              {returnTo && <p className="mt-1 text-sm italic">You'll be redirected to {returnTo} after login</p>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="admin@yulu.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-center text-sm text-muted-foreground w-full">
              Demo credentials for testing
            </p>
            <div className="flex flex-col gap-2 w-full">
              {[{ email: 'admin@yulu.com', password: 'admin123', label: 'Default Admin' }].map((cred, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillDemoCredentials(cred.email, cred.password)}
                  className="w-full"
                >
                  Use {cred.label} credentials
                </Button>
              ))}
            </div>
            <div className="mt-4 text-center w-full">
              <a href="/mobile/login" className="text-sm text-blue-600 hover:underline">
                Go to Employee App Login
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
