
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Demo credentials for testing specific access
  const demoCredentials = [
    { email: 'admin@yulu.com', password: 'admin123', label: 'Default Admin' },
    { email: 'sagar.km@yulu.bike', password: '123456', label: 'Sagar KM (Security Admin)' }
  ];

  useEffect(() => {
    // Check if user is already logged in
    if (authState.isAuthenticated) {
      console.log("User already authenticated, redirecting to:", returnTo || '/admin/dashboard');
      navigate(returnTo || '/admin/dashboard', { replace: true });
    }
  }, [authState.isAuthenticated, navigate, returnTo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log("Attempting to login to admin dashboard with:", email);
      console.log("Return path after login:", returnTo);
      
      // Try login through authContext
      const success = await signIn(email, password);
      
      if (success) {
        // Ensure auth state is refreshed
        await refreshAuth();
        
        // Check if the user is an admin/dashboard user or regular employee
        const userDataString = localStorage.getItem("yuluUser");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          
          // Define dashboard roles
          const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin'];
          
          // Check if user has permission to access admin dashboard
          if ((userData.role && dashboardUserRoles.includes(userData.role)) || userData.email === 'sagar.km@yulu.bike') {
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
          setErrorMessage("User data not found. Please try again.");
          await logout();
        }
      } else {
        setErrorMessage('Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'An error occurred during login');
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
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
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
              {demoCredentials.map((cred, index) => (
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
