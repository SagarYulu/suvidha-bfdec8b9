
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { EyeIcon, SmartphoneIcon, KeyIcon } from "lucide-react";

const MobileLogin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Use email login with the mobile number as email
      const emailToUse = mobileNumber.includes("@") 
        ? mobileNumber 
        : `${mobileNumber}@yulu.bike`; // Convert mobile to email if needed
      
      const success = await login(emailToUse, password);
      
      if (success) {
        navigate("/mobile/issues");
      } else {
        setError("Invalid credentials. Please try again.");
        toast({
          title: "Login failed",
          description: "Invalid credentials. Please try again.",
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#ace4eb]">
      {/* Background with Yulu bike image */}
      <div className="bg-[#00CEDE] h-[65vh] w-full flex justify-center items-center">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-[url('/public/lovable-uploads/116a8c5c-c42f-452e-8ab8-6fe4b102f8db.png')] bg-center bg-contain bg-no-repeat"></div>
        </div>
      </div>

      {/* Login form */}
      <div className="px-6 pt-8">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Mobile Number Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SmartphoneIcon className="h-5 w-5 text-[#00CEDE]" />
            </div>
            <div className="absolute inset-y-0 left-9 flex items-center pointer-events-none">
              <span className="text-gray-500">+91</span>
            </div>
            <Input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              placeholder="Mobile Number"
              className="pl-20 border-b border-t-0 border-x-0 rounded-none focus:ring-0 focus:border-[#00CEDE] py-2 bg-transparent"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <KeyIcon className="h-5 w-5 text-[#00CEDE]" />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="pl-10 pr-10 border-b border-t-0 border-x-0 rounded-none focus:ring-0 focus:border-[#00CEDE] py-2 bg-transparent"
            />
            <button 
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <EyeIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full py-3 text-lg font-medium rounded-md bg-[#00CEDE] hover:bg-[#00BECC] text-white"
            disabled={isLoading}
          >
            Log in
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Use your employee email and password
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
