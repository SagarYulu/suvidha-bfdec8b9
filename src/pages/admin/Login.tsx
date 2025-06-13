
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

  // Define admin/dashboard roles
  const adminRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
  const adminEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];

  useEffect(() => {
    const checkInitialAuth = () => {
      if (initialCheckDone.current) return;
      
      initialCheckDone.current = true;
      
      if (authState.isAuthenticated && authState.role) {
        const isAdminRole = adminRoles.includes(authState.role);
        const isAdminEmail = adminEmails.includes(authState.user?.email || '');
        
        if (isAdminRole || isAdminEmail) {
          console.log("Admin user already authenticated, redirecting to:", returnTo || '/admin/dashboard');
          navigate(returnTo || '/admin/dashboard', { replace: true });
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard. Please use the employee mobile app.",
            variant: "destructive",
          });
          logout();
        }
      }
    };
    
    checkInitialAuth();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log("Attempting admin dashboard login with:", email);
      
      const success = await signIn(email, password);
      
      if (success) {
        await refreshAuth();
        
        const userDataString = localStorage.getItem("mockUser");
        const userData = userDataString ? JSON.parse(userDataString) : null;
        
        const isAdminRole = userData?.role && adminRoles.includes(userData.role);
        const isAdminEmail = adminEmails.includes(userData?.email || '');
        
        if (isAdminRole || isAdminEmail) {
          toast({
            description: 'Admin login successful!'
          });
          
          const redirectPath = returnTo || '/admin/dashboard';
          console.log("Admin login successful, redirecting to:", redirectPath);
          navigate(redirectPath, { replace: true });
        } else {
          setErrorMessage("Access denied. This login is for admin dashboard only. Regular employees should use the mobile app.");
          toast({
            title: "Access Denied",
            description: "This login is for admin dashboard only. Regular employees should use the mobile app at /mobile/login",
            variant: "destructive",
          });
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
            <CardTitle className="text-2xl font-bold">Yulu Admin Dashboard</CardTitle>
            <CardDescription>
              Admin login only - Regular employees use the mobile app
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
                  <Label htmlFor="email">Admin Email</Label>
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
                {isLoading ? 'Signing in...' : 'Admin Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-center text-sm text-muted-foreground w-full">
              Admin credentials only
            </p>
            <div className="flex flex-col gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('admin@yulu.com', 'admin123')}
                className="w-full"
              >
                Use Admin Demo Credentials
              </Button>
            </div>
            <div className="mt-4 text-center w-full">
              <a href="/mobile/login" className="text-sm text-blue-600 hover:underline">
                Employee? Go to Mobile App Login
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
