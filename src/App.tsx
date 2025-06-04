
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RBACProvider } from "@/contexts/RBACContext";

import Index from "./pages/Index";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Issues from "./pages/admin/Issues";
import IssueDetails from "./pages/admin/IssueDetails";
import AssignedIssues from "./pages/admin/AssignedIssues";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import AccessControl from "./pages/admin/AccessControl";
import AddDashboardUser from "./pages/admin/dashboard-users/AddDashboardUser";
import FeedbackAnalytics from "./pages/admin/FeedbackAnalytics";
import SentimentAnalysis from "./pages/admin/SentimentAnalysis";
import TestDataGenerator from "./pages/admin/TestDataGenerator";

// Mobile pages
import MobileLogin from "./pages/mobile/Login";
import MobileIssues from "./pages/mobile/Issues";
import MobileIssueDetails from "./pages/mobile/IssueDetails";
import NewIssue from "./pages/mobile/NewIssue";
import MobileSentiment from "./pages/mobile/Sentiment";

// Database Export page
import DatabaseExport from "./pages/DatabaseExport";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RBACProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Database Export Route */}
              <Route path="/export" element={<DatabaseExport />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/issues" element={<Issues />} />
              <Route path="/admin/issues/:id" element={<IssueDetails />} />
              <Route path="/admin/assigned-issues" element={<AssignedIssues />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/users/add" element={<AddDashboardUser />} />
              <Route path="/admin/dashboard-users/add" element={<AddDashboardUser />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/access-control" element={<AccessControl />} />
              <Route path="/admin/feedback-analytics" element={<FeedbackAnalytics />} />
              <Route path="/admin/sentiment-analysis" element={<SentimentAnalysis />} />
              <Route path="/admin/test-data" element={<TestDataGenerator />} />

              {/* Mobile Routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />
              <Route path="/mobile/issues" element={<MobileIssues />} />
              <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
              <Route path="/mobile/new-issue" element={<NewIssue />} />
              <Route path="/mobile/sentiment" element={<MobileSentiment />} />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RBACProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
