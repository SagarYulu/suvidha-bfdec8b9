
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-yulu-blue p-8">
          <h1 className="text-4xl font-bold text-white text-center">Yulu Issue Resolver</h1>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-center">Welcome</h2>
            <p className="text-gray-600 text-center">
              Choose which application you want to access
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={() => navigate("/admin/dashboard")}
              className="py-6 bg-yulu-blue hover:bg-blue-700"
            >
              Admin Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/mobile/login")}
              variant="outline"
              className="py-6 border-2 border-yulu-blue text-yulu-blue hover:bg-gray-100"
            >
              Employee Mobile App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
