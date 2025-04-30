
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const MobileLogin = () => {
  const [email, setEmail] = useState("admin@yulu.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", { email, password });
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Check if the user is an admin or employee and redirect accordingly
        const userDataString = localStorage.getItem("yuluUser");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          
          // Admin roles: hr_admin, city_head, ops
          if (userData.role === "hr_admin" || userData.role === "city_head" || userData.role === "ops") {
            navigate("/admin/dashboard");
          } 
          // Employee role
          else if (userData.role === "employee") {
            navigate("/mobile/issues");
          }
        }
      } else {
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yulu-blue">Yulu Employee App</h1>
            <p className="text-gray-600 mt-2">Sign in to continue</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email" 
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-yulu-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>For employee login, use: rahul@yulu.com / employee123</p>
            <p>For admin login, use: admin@yulu.com / admin123</p>
            <p className="mt-2">
              <a href="/" className="text-yulu-blue hover:underline">
                Back to Home
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
