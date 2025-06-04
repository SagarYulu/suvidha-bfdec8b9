
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from "@/hooks/useErrorHandler";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock authentication (independent of Supabase)
      const mockUsers = [
        { email: 'admin@windsurf.com', password: 'admin123', role: 'admin', name: 'Admin User', id: '1' },
        { email: 'manager@windsurf.com', password: 'manager123', role: 'manager', name: 'Manager User', id: '2' },
        { email: 'support@windsurf.com', password: 'support123', role: 'support', name: 'Support Agent', id: '3' }
      ];

      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Store auth token and user data
        localStorage.setItem('authToken', 'mock-jwt-token');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        handleSuccess('Login successful!');
        navigate('/admin/dashboard');
      } else {
        handleError(new Error('Invalid email or password'));
      }
    } catch (error) {
      handleError(error, 'Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Windsurf Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Demo accounts:</p>
            <p>admin@windsurf.com / admin123</p>
            <p>manager@windsurf.com / manager123</p>
            <p>support@windsurf.com / support123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
