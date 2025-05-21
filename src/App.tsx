
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RBACProvider } from "./contexts/RBACContext";

// Import all pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminIssues from "./pages/admin/Issues";
import AdminAssignedIssues from "./pages/admin/AssignedIssues";
import AdminIssueDetails from "./pages/admin/IssueDetails";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import AdminLogin from "./pages/admin/Login";
import AdminAccessControl from "./pages/admin/AccessControl";
import AdminResolutionFeedback from "./pages/admin/ResolutionFeedback";
import MobileLogin from "./pages/mobile/Login";
import MobileIssues from "./pages/mobile/Issues";
import MobileNewIssue from "./pages/mobile/NewIssue";
import MobileIssueDetails from "./pages/mobile/IssueDetails";
import AddDashboardUser from "./pages/admin/dashboard-users/AddDashboardUser";
import TestDataGenerator from "./pages/admin/TestDataGenerator";
import FeedbackAnalytics from "./pages/FeedbackAnalytics";

// Import guards
import {
  DashboardGuard,
  UserManagementGuard,
  IssuesGuard,
  AnalyticsGuard,
  SettingsGuard,
  SecurityGuard,
  CreateDashboardUserGuard
} from "./components/guards/PermissionGuards";
import TicketAccessGuard from "./components/guards/TicketAccessGuard";

// Create a new QueryClient instance with more relaxed defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log("App rendering - setting up providers");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RBACProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Protected Admin Routes with Guards */}
                <Route path="/admin/dashboard" element={
                  <DashboardGuard redirectTo="/admin/login">
                    <AdminDashboard />
                  </DashboardGuard>
                } />
                
                <Route path="/admin/users" element={
                  <UserManagementGuard>
                    <AdminUsers />
                  </UserManagementGuard>
                } />
                
                <Route path="/admin/issues" element={
                  <IssuesGuard>
                    <TicketAccessGuard onlyForAssigned={false}>
                      <AdminIssues />
                    </TicketAccessGuard>
                  </IssuesGuard>
                } />
                
                <Route path="/admin/assigned-issues" element={
                  <IssuesGuard>
                    <TicketAccessGuard onlyForAssigned={true}>
                      <AdminAssignedIssues />
                    </TicketAccessGuard>
                  </IssuesGuard>
                } />
                
                <Route path="/admin/issues/:id" element={
                  <IssuesGuard>
                    <AdminIssueDetails />
                  </IssuesGuard>
                } />
                
                <Route path="/admin/analytics" element={
                  <AnalyticsGuard>
                    <AdminAnalytics />
                  </AnalyticsGuard>
                } />

                <Route path="/admin/resolution-feedback" element={
                  <AnalyticsGuard>
                    <AdminResolutionFeedback />
                  </AnalyticsGuard>
                } />
                
                <Route path="/admin/settings" element={
                  <SettingsGuard>
                    <AdminSettings />
                  </SettingsGuard>
                } />
                
                <Route path="/admin/access-control" element={
                  <SecurityGuard>
                    <AdminAccessControl />
                  </SecurityGuard>
                } />
                
                <Route path="/admin/test-data-generator" element={
                  <AnalyticsGuard>
                    <TestDataGenerator />
                  </AnalyticsGuard>
                } />
                
                {/* Dashboard Users Routes */}
                <Route path="/admin/dashboard-users/add" element={
                  <CreateDashboardUserGuard>
                    <AddDashboardUser />
                  </CreateDashboardUserGuard>
                } />
                
                <Route path="/admin/dashboard-users" element={
                  <UserManagementGuard>
                    <AdminUsers />
                  </UserManagementGuard>
                } />

                <Route path="/admin/dashboard-users/security" element={
                  <SecurityGuard>
                    <AdminAccessControl />
                  </SecurityGuard>
                } />
                
                {/* Mobile Routes */}
                <Route path="/mobile/login" element={<MobileLogin />} />
                <Route path="/mobile/issues" element={<MobileIssues />} />
                <Route path="/mobile/issues/new" element={<MobileNewIssue />} />
                <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
                
                {/* New Feedback Analytics Route */}
                <Route path="/feedback-analytics" element={
                  <DashboardGuard redirectTo="/admin/login">
                    <FeedbackAnalytics />
                  </DashboardGuard>
                } />
                
                {/* Add a catchall route to redirect users from /admin/sentiment to the dashboard */}
                <Route path="/admin/sentiment" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/mobile/sentiment" element={<Navigate to="/mobile/issues" replace />} />
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
