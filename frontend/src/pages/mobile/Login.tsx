
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function MobileLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !phone) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      // Pass isAdminLogin = false for mobile app login
      await login(employeeId, phone, false);
      toast.success('Login successful');
      navigate('/mobile/issues');
    } catch (error: any) {
      if (error.message.includes('Admin users cannot access the mobile app')) {
        setError('Access denied. Admin users should use the dashboard login.');
      } else {
        setError('Invalid employee ID or phone number');
      }
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmployeeId('employee@yulu.com');
    setPhone('emp123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Employee Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your employee ID"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              onClick={fillDemoCredentials}
              className="w-full"
              disabled={isLoading}
            >
              Use Employee Demo Credentials
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                For employees only
              </p>
              <a href="/admin/login" className="text-sm text-blue-600 hover:underline">
                Admin? Go to Dashboard Login
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
