
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RBACProvider } from "@/contexts/RBACContext";

// Main pages
import Index from "./pages/Index";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTestDashboard from "./pages/admin/TestDashboard";
import AdminIssues from "./pages/admin/Issues";
import AdminIssueDetails from "./pages/admin/IssueDetails";
import AdminAssignedIssues from "./pages/admin/AssignedIssues";
import AdminUsers from "./pages/admin/Users";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminFeedbackAnalytics from "./pages/admin/FeedbackAnalytics";
import AdminSettings from "./pages/admin/Settings";
import AdminDashboardUserAdd from "./pages/admin/DashboardUserAdd";
import AdminAccessControl from "./pages/admin/AccessControl";

// Mobile pages
import MobileLogin from "./pages/mobile/Login";
import MobileIssues from "./pages/mobile/Issues";
import MobileNewIssue from "./pages/mobile/NewIssue";
import MobileCreateIssue from "./pages/mobile/CreateIssue";
import MobileIssueDetails from "./pages/mobile/IssueDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RBACProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Main routes */}
              <Route path="/" element={<Index />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/test-dashboard" element={<AdminTestDashboard />} />
              <Route path="/admin/issues" element={<AdminIssues />} />
              <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
              <Route path="/admin/assigned-issues" element={<AdminAssignedIssues />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/feedback-analytics" element={<AdminFeedbackAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/dashboard-users/add" element={<AdminDashboardUserAdd />} />
              <Route path="/admin/access-control" element={<AdminAccessControl />} />

              {/* Mobile routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />
              <Route path="/mobile/issues" element={<MobileIssues />} />
              <Route path="/mobile/issues/new" element={<MobileNewIssue />} />
              <Route path="/mobile/issues/create" element={<MobileCreateIssue />} />
              <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RBACProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
