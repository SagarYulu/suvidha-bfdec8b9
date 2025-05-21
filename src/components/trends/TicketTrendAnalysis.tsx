
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { download } from "lucide-react";
import { exportToCSV } from "@/utils/csvExportUtils";
import { useTicketTrendAnalytics } from "@/hooks/useTicketTrendAnalytics";
import TicketTrendFilterBar from "./TicketTrendFilterBar";
import TicketTrendKPIs from "./TicketTrendKPIs";
import TicketTrendCharts from "./TicketTrendCharts";
import TicketSpikeAlerts from "./TicketSpikeAlerts";
import ResolverPerformance from "./ResolverPerformance";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendFilters } from "@/services/issues/ticketTrendService";

interface TicketTrendAnalysisProps {
  // Optional props can be passed here if needed
}

const TicketTrendAnalysis: React.FC<TicketTrendAnalysisProps> = () => {
  // Initialize with default filters
  const [filters, setFilters] = useState<TrendFilters>({
    comparisonMode: "week",
    dateRange: {
      start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  // Use our custom hook to fetch and manage trend analytics data
  const { analytics, isLoading, error, managers, roles } = useTicketTrendAnalytics({ filters });

  // Handle filter changes
  const handleFilterChange = (newFilters: TrendFilters) => {
    setFilters(newFilters);
  };

  // Handle full data export
  const handleExportAllData = () => {
    if (!analytics) return;

    // Export all ticket trend data
    const trendData = analytics.ticketTrends.map(point => ({
      'Date': point.date,
      'Tickets Raised': point.raised,
      'Tickets Closed': point.closed,
      'Comparison Date': point.comparisonDate,
      'Comparison Raised': point.comparisonRaised || 0,
      'Comparison Closed': point.comparisonClosed || 0
    }));
    
    exportToCSV(trendData, `ticket-trend-complete-data-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Ticket Trend Analysis</CardTitle>
            {analytics && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleExportAllData}
              >
                Export All Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Analyze ticket trends, response times, and performance metrics across different periods and dimensions.
          </div>
          
          {/* Filter bar */}
          <TicketTrendFilterBar
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            managers={managers}
            roles={roles}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <p className="text-lg font-medium">Error loading trend data</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Key Performance Metrics</h3>
            {isLoading || !analytics ? (
              <Skeleton className="w-full h-48" /> 
            ) : (
              <TicketTrendKPIs data={analytics.kpis} isLoading={isLoading} />
            )}
          </div>

          {/* Charts Section */}
          {isLoading || !analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-80" />
              ))}
            </div>
          ) : (
            <TicketTrendCharts data={analytics} isLoading={isLoading} />
          )}

          {/* Alerts and Resolver Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Ticket Spike Alerts */}
            {!isLoading && analytics && (
              <TicketSpikeAlerts spikes={analytics.ticketSpikes} isLoading={isLoading} />
            )}

            {/* Resolver Performance */}
            {!isLoading && analytics && (
              <ResolverPerformance resolvers={analytics.closureByAssignee} isLoading={isLoading} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TicketTrendAnalysis;
