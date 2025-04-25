
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, File, FilePlus, User, LogOut } from "lucide-react";
import { useEffect } from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, title }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState.isAuthenticated || authState.role !== "employee") {
      navigate("/mobile/login");
    }
  }, [authState, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-yulu-blue text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">{title}</h1>
        {authState.isAuthenticated && (
          <p className="text-sm opacity-75">Hello, {authState.user?.name}</p>
        )}
      </header>

      {/* Content */}
      <main className="flex-grow p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate("/mobile/issues")}
            className="flex flex-col items-center py-3 flex-1"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => navigate("/mobile/issues/new")}
            className="flex flex-col items-center py-3 flex-1"
          >
            <FilePlus className="h-5 w-5" />
            <span className="text-xs mt-1">New Issue</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/mobile/login");
            }}
            className="flex flex-col items-center py-3 flex-1"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
