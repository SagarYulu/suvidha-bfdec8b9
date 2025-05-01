
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      console.log("Attempting admin login with:", { email, password });
      const success = await login(email, password);
      
      if (success) {
        // Check if the user is actually an admin
        const userDataString = localStorage.getItem("yuluUser");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.role === "admin" || userData.role === "ops_head") {
            toast({
              title: "Login successful",
              description: "Welcome to the Suvidha dashboard!",
            });
            navigate("/admin/dashboard");
          } else {
            // If not admin or ops_head, log them out and show error
            localStorage.removeItem("yuluUser");
            setError("You do not have dashboard access privileges.");
            toast({
              title: "Access denied",
              description: "You do not have dashboard access privileges",
              variant: "destructive",
            });
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
      console.error("Admin login error:", error);
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
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yulu-blue">Yulu Suvidha Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to access the dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md flex items-center text-red-800">
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
                placeholder="Email"
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
                placeholder="Password"
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
            <p>For dashboard access only</p>
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

export default AdminLogin;
