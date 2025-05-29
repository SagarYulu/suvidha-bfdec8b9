import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RBACProvider } from "./contexts/RBACContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminIssues from "./pages/admin/Issues";
import AdminIssueDetails from "./pages/admin/IssueDetails";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminFeedbackAnalytics from "./pages/admin/FeedbackAnalytics";
import AdminSentimentAnalysis from "./pages/admin/SentimentAnalysis";
import AdminAssignedIssues from "./pages/admin/AssignedIssues";
import AdminAccessControl from "./pages/admin/AccessControl";
import AdminTestDataGenerator from "./pages/admin/TestDataGenerator";
import AddDashboardUser from "./pages/admin/dashboard-users/AddDashboardUser";

// Mobile Pages
import MobileLogin from "./pages/mobile/Login";
import MobileIssues from "./pages/mobile/Issues";
import MobileNewIssue from "./pages/mobile/NewIssue";
import MobileIssueDetails from "./pages/mobile/IssueDetails";
import MobileSentiment from "./pages/mobile/Sentiment";

// Other Pages
import DatabaseExport from "./pages/DatabaseExport";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RBACProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Root redirect */}
                <Route path="/" element={<Index />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/issues" element={<AdminIssues />} />
                <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/add" element={<AddDashboardUser />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/feedback" element={<AdminFeedbackAnalytics />} />
                <Route path="/admin/sentiment" element={<AdminSentimentAnalysis />} />
                <Route path="/admin/assigned-issues" element={<AdminAssignedIssues />} />
                <Route path="/admin/access-control" element={<AdminAccessControl />} />
                <Route path="/admin/test-data" element={<AdminTestDataGenerator />} />
                
                {/* Mobile Routes - IMPORTANT: /new route must come before /:id route */}
                <Route path="/mobile/login" element={<MobileLogin />} />
                <Route path="/mobile/issues" element={<MobileIssues />} />
                <Route path="/mobile/issues/new" element={<MobileNewIssue />} />
                <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
                <Route path="/mobile/sentiment" element={<MobileSentiment />} />
                
                {/* Other Routes */}
                <Route path="/database-export" element={<DatabaseExport />} />
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </RBACProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
