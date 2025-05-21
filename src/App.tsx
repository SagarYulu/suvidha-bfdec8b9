
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Index from "./pages/Index";
import Dashboard from "./pages/admin/Dashboard";
import Issues from "./pages/admin/Issues";
import IssueDetails from "./pages/admin/IssueDetails";
import Users from "./pages/admin/Users";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";
import AccessControl from "./pages/admin/AccessControl";
import TestDataGenerator from "./pages/admin/TestDataGenerator";
import ResolutionFeedback from "./pages/admin/ResolutionFeedback";
import SentimentAnalysis from "./pages/admin/SentimentAnalysis";
import FeedbackAnalytics from "./pages/FeedbackAnalytics";
import AssignedIssues from "./pages/admin/AssignedIssues";
// Include our new TicketTrendAnalysis page in imports
import TicketTrendAnalysis from "./pages/TicketTrendAnalysis";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { PermissionProvider } from "./contexts/PermissionContext";
import Login from "./components/admin/Login";

const App = () => {
  // Check if the current environment is the client-side
  const isClient = typeof window !== 'undefined';

  // Function to determine the initial authentication state
  const getInitialAuthState = () => {
    if (isClient) {
      const storedAuth = localStorage.getItem('auth');
      return storedAuth ? JSON.parse(storedAuth) : { isAuthenticated: false, user: null, role: null };
    }
    return { isAuthenticated: false, user: null, role: null };
  };

  // Use the initial auth state
  const initialAuthState = React.useMemo(() => getInitialAuthState(), [isClient]);

  // Update your router configuration to include the new route
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
      errorElement: <NotFound />,
    },
    {
      path: "/admin/login",
      element: <Login />,
    },
    {
      path: "/admin/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/admin/ticket-trends",
      element: <TicketTrendAnalysis />,
    },
    {
      path: "/admin/issues",
      element: <Issues />,
    },
    {
      path: "/admin/issues/:id",
      element: <IssueDetails />,
    },
    {
      path: "/admin/users",
      element: <Users />,
    },
    {
      path: "/admin/analytics",
      element: <Analytics />,
    },
    {
      path: "/admin/settings",
      element: <Settings />,
    },
    {
      path: "/admin/access-control",
      element: <AccessControl />,
    },
    {
      path: "/admin/test-data-generator",
      element: <TestDataGenerator />,
    },
    {
      path: "/admin/resolution-feedback",
      element: <ResolutionFeedback />,
    },
    {
      path: "/admin/sentiment-analysis",
      element: <SentimentAnalysis />,
    },
    {
      path: "/admin/feedback-analytics",
      element: <FeedbackAnalytics />,
    },
    {
      path: "/admin/assigned-issues",
      element: <AssignedIssues />,
    },
  ]);

  return (
    <AuthProvider>
      <PermissionProvider>
        <RouterProvider router={router} />
        <Toaster />
      </PermissionProvider>
    </AuthProvider>
  );
};

export default App;
