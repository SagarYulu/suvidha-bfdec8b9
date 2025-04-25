
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, ChartBar, File, Home, LogOut, Settings, Users } from "lucide-react";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminLayout auth check:", authState);
    
    if (!authState.isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      navigate("/mobile/login");
      return;
    }
    
    if (authState.role !== "admin") {
      console.log("Not an admin, role is:", authState.role);
      navigate("/");
      return;
    }
    
    console.log("Admin authentication successful");
  }, [authState, navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-yulu-blue text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Yulu Admin</h2>
        </div>
        <nav className="mt-8">
          <div className="px-4 py-2">
            <button 
              onClick={() => navigate("/admin/dashboard")} 
              className="flex items-center w-full px-4 py-2 mb-1 rounded hover:bg-blue-700 transition-colors"
            >
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </button>
            
            <button 
              onClick={() => navigate("/admin/users")}
              className="flex items-center w-full px-4 py-2 mb-1 rounded hover:bg-blue-700 transition-colors"
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </button>
            
            <button 
              onClick={() => navigate("/admin/issues")}
              className="flex items-center w-full px-4 py-2 mb-1 rounded hover:bg-blue-700 transition-colors"
            >
              <File className="mr-2 h-5 w-5" />
              Issues
            </button>
            
            <button 
              onClick={() => navigate("/admin/analytics")}
              className="flex items-center w-full px-4 py-2 mb-1 rounded hover:bg-blue-700 transition-colors"
            >
              <ChartBar className="mr-2 h-5 w-5" />
              Analytics
            </button>
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button 
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center w-full px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-md border-b">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-yulu-blue text-white flex items-center justify-center">
                  {authState.user?.name.charAt(0)}
                </div>
                <span className="ml-2">{authState.user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
