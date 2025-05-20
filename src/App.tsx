
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import NotFound from "./pages/NotFound";
import MobileLayout from "./components/MobileLayout";
import MobileSentiment from "./pages/mobile/Sentiment";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminLogin from "./pages/admin/Login";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Index from "./pages/Index";

const App: React.FC = () => {
  const { authState, refreshSession } = useAuth();
  const { toast } = useToast();
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    // Use the refreshSession function from AuthContext instead
    const checkAuthSession = async () => {
      try {
        await refreshSession();
        setIsSessionChecked(true);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSessionChecked(true);
      }
    };

    checkAuthSession();
  }, [toast, refreshSession]);

  // Define a function to check if the user is an admin
  const isAdmin = authState?.role === "admin";

  // Define a function to check if the user is authenticated
  const isAuthenticated = authState?.isAuthenticated;

  if (!isSessionChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - Use our Index page as default */}
        <Route path="/" element={<Index />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            isAdmin ? <Navigate to="/admin/analytics" /> : <Navigate to="/admin/login" />
          }
        />
        <Route
          path="/admin/analytics"
          element={
            isAdmin ? <AdminAnalytics /> : <Navigate to="/admin/login" />
          }
        />

        {/* Mobile Routes */}
        <Route
          path="/mobile"
          element={
            isAuthenticated ? (
              <MobileLayout title="Dashboard">
                <div>Mobile Dashboard</div>
              </MobileLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/mobile/sentiment"
          element={
            isAuthenticated ? <MobileSentiment /> : <Navigate to="/admin/login" />
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
