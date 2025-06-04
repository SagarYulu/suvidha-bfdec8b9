
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { RBACProvider } from "@/contexts/RBACContext";

// Layout components
import AdminLayout from "@/components/layout/AdminLayout";

// Pages
import Dashboard from "@/pages/admin/Dashboard";
import Issues from "@/pages/admin/Issues";
import Users from "@/pages/admin/Users";
import Analytics from "@/pages/admin/Analytics";
import Exports from "@/pages/admin/Exports";
import Settings from "@/pages/admin/Settings";
import Login from "@/pages/Login";

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RBACProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="issues" element={<Issues />} />
              <Route path="users" element={<Users />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="exports" element={<Exports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
          
          <Toaster />
        </Router>
      </RBACProvider>
    </QueryClientProvider>
  );
}

export default App;
