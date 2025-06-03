
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Issues from "./pages/admin/Issues";
import IssueDetails from "./pages/admin/IssueDetails";
import AssignedIssues from "./pages/admin/AssignedIssues";
import Analytics from "./pages/admin/Analytics";

// Mobile pages
import MobileLogin from "./pages/mobile/Login";
import MobileIssues from "./pages/mobile/Issues";
import MobileIssueDetails from "./pages/mobile/IssueDetails";
import NewIssue from "./pages/mobile/NewIssue";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/issues" element={<Issues />} />
            <Route path="/admin/issues/:id" element={<IssueDetails />} />
            <Route path="/admin/assigned-issues" element={<AssignedIssues />} />
            <Route path="/admin/analytics" element={<Analytics />} />

            {/* Mobile Routes */}
            <Route path="/mobile/login" element={<MobileLogin />} />
            <Route path="/mobile/issues" element={<MobileIssues />} />
            <Route path="/mobile/issues/:id" element={<MobileIssueDetails />} />
            <Route path="/mobile/new-issue" element={<NewIssue />} />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
