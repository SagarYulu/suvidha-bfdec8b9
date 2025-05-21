
import React from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from "@/components/AdminLayout";
import TicketTrendAnalysis from "@/components/trends/TicketTrendAnalysis";

// Create a query client for this page
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const TicketTrendAnalysisPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminLayout title="Ticket Trend Analysis" requiredPermission="view:dashboard">
        <TicketTrendAnalysis />
      </AdminLayout>
    </QueryClientProvider>
  );
};

export default TicketTrendAnalysisPage;
