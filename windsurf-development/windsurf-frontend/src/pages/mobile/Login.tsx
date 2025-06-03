
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { MailIcon, UserIcon } from "lucide-react";

const MobileLogin = () => {
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, employeeId);
      
      if (success) {
        toast({
          title: "Verification successful",
          description: "Welcome back!",
        });
        navigate("/mobile/issues", { replace: true });
      } else {
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

  return (
    <div className="min-h-screen bg-[#1E40AF]/10">
      <div className="bg-[#1E40AF] h-[40vh] w-full"></div>

      <div className="relative px-6 mx-auto max-w-md -mt-32">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-center text-[#1E40AF] mb-10">
              Yulu Suvidha
            </h1>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-8">
              <div className="space-y-2">
                <label className="text-gray-500 text-sm font-medium ml-1">Email ID</label>
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
              <p className="text-sm text-gray-500">
                Use your employee email and employee ID
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
