
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

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authState, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { returnTo } = (location.state as LocationState) || {};

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.role) {
      const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
      
      if (dashboardUserRoles.includes(authState.role) || authState.user?.email === 'admin@yulu.com') {
        navigate(returnTo || '/admin/dashboard', { replace: true });
      }
    }
  }, [authState, navigate, returnTo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const success = await signIn(email, password);
      
      if (success) {
        const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
        
        if (authState.user?.role && dashboardUserRoles.includes(authState.user.role) || authState.user?.email === 'admin@yulu.com') {
          toast({
            description: 'Login successful!'
          });
          
          navigate(returnTo || '/admin/dashboard', { replace: true });
        } else {
          setErrorMessage("Access denied. You don't have permission to access the admin dashboard.");
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('admin@yulu.com', 'admin123')}
                className="w-full"
              >
                Use Admin credentials
              </Button>
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

export default AdminLogin;
