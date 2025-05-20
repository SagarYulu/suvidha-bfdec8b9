import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import UpdateProfilePage from "./pages/UpdateProfile";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import NewIssue from "./pages/NewIssue";
import IssueDetails from "./pages/IssueDetails";
import MobileIssueDetails from "./pages/mobile/MobileIssueDetails";
import MobileNewIssue from "./pages/mobile/MobileNewIssue";
import MobileDashboard from "./pages/mobile/MobileDashboard";
import MobileIssues from "./pages/mobile/MobileIssues";
import MobileLayout from "./components/MobileLayout";
import MobileSentiment from "./pages/mobile/Sentiment";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserForm from "./pages/admin/AdminUserForm";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminAnalytics from "./pages/admin/Analytics";
import SentimentAnalysis from "./pages/admin/SentimentAnalysis";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminEmployeeImport from "./pages/admin/AdminEmployeeImport";
import AdminEmployeeDetails from "./pages/admin/AdminEmployeeDetails";
import { checkSession } from "./services/authService";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const App: React.FC = () => {
  const { authState, dispatch } = useAuth();
  const { toast } = useToast();
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    const checkAuthSession = async () => {
      const session = await checkSession();
      if (session) {
        dispatch({
          type: "LOGIN",
          payload: {
            user: session.user,
            role: session.role,
          },
        });
        toast({
          title: "Welcome Back!",
          description: `You have been automatically signed in.`,
          action: <ToastAction altText="Goto profile">Profile</ToastAction>,
        });
      }
      setIsSessionChecked(true);
    };

    checkAuthSession();
  }, [dispatch, toast]);

  // Define a function to check if the user is an admin
  const isAdmin = authState?.role === "admin";

  // Define a function to check if the user is an employee
  const isEmployee = authState?.role === "employee";

  // Define a function to check if the user is authenticated
  const isAuthenticated = authState?.isAuthenticated;

  if (!isSessionChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  const adminRoutes = [
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/users", element: <AdminUsers /> },
    { path: "/admin/users/new", element: <AdminUserForm /> },
    { path: "/admin/users/:id", element: <AdminUserForm /> },
    { path: "/admin/permissions", element: <AdminPermissions /> },
    { path: "/admin/roles", element: <AdminRoles /> },
    { path: "/admin/analytics", element: <AdminAnalytics /> },
    // Comment out the sentiment analysis route
    // { path: "/admin/sentiment", element: <SentimentAnalysis /> },
    { path: "/admin/employees", element: <AdminEmployees /> },
    { path: "/admin/employees/import", element: <AdminEmployeeImport /> },
    { path: "/admin/employees/:id", element: <AdminEmployeeDetails /> },
  ];

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Authenticated Employee Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/update-profile"
          element={
            isAuthenticated ? <UpdateProfilePage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/issues"
          element={isAuthenticated ? <Issues /> : <Navigate to="/login" />}
        />
        <Route
          path="/issues/new"
          element={
            isAuthenticated ? <NewIssue /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/issues/:id"
          element={
            isAuthenticated ? <IssueDetails /> : <Navigate to="/login" />
          }
        />

        {/* Mobile Routes - Employee */}
        <Route
          path="/mobile"
          element={
            isAuthenticated ? (
              <MobileLayout>
                <MobileDashboard />
              </MobileLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mobile/dashboard"
          element={
            isAuthenticated ? <MobileDashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/mobile/issues"
          element={
            isAuthenticated ? <MobileIssues /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/mobile/issues/new"
          element={
            isAuthenticated ? <MobileNewIssue /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/mobile/issues/:id"
          element={
            isAuthenticated ? <MobileIssueDetails /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/mobile/sentiment"
          element={
            isAuthenticated ? <MobileSentiment /> : <Navigate to="/login" />
          }
        />

        {/* Admin Routes */}
        {adminRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              isAdmin ? (
                route.element
              ) : (
                <Navigate to="/" />
              ) /* Redirect to dashboard if not admin */
            }
          />
        ))}

        {/* Fallback Route - Redirect to Dashboard if authenticated, otherwise to Login */}
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
