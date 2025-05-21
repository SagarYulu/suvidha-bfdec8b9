
import { useState, useEffect, memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterCard } from "./FilterCard";
import { useAnalyticsFilters } from "./useAnalyticsFilters";
import { TicketTrendAnalysis } from "./TicketTrendAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SLADashboard } from "./SLADashboard";
import { COMPARISON_MODES } from "./useAnalyticsFilters";

interface AdvancedAnalyticsSectionProps {
  onFilterChange?: (filters: any) => void; // New prop to pass filters up to parent
}

// Use memo to prevent unnecessary re-renders
export const AdvancedAnalyticsSection = memo(({ onFilterChange }: AdvancedAnalyticsSectionProps) => {
  const [activeTab, setActiveTab] = useState("trends");
  const {
    filters,
    managers,
    availableClusters,
    activeFiltersCount,
    handleCityChange,
    handleClusterChange,
    handleManagerChange,
    handleRoleChange,
    handleIssueTypeChange,
    handleDateRangeChange,
    handleComparisonModeToggle,
    handleComparisonModeChange,
    clearFilters
  } = useAnalyticsFilters();

  // Effect to pass filters up to parent when they change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Memoize FilterCard props to prevent unnecessary re-renders
  const filterCardProps = useMemo(() => ({
    filters,
    availableClusters,
    managers,
    comparisonModes: COMPARISON_MODES,
    activeFiltersCount,
    onCityChange: handleCityChange,
    onClusterChange: handleClusterChange,
    onManagerChange: handleManagerChange,
    onRoleChange: handleRoleChange,
    onIssueTypeChange: handleIssueTypeChange,
    onDateRangeChange: handleDateRangeChange,
    onComparisonModeToggle: handleComparisonModeToggle,
    onComparisonModeChange: handleComparisonModeChange,
    onClearFilters: clearFilters
  }), [
    filters,
    availableClusters,
    managers,
    activeFiltersCount,
    handleCityChange,
    handleClusterChange,
    handleManagerChange,
    handleRoleChange,
    handleIssueTypeChange,
    handleDateRangeChange,
    handleComparisonModeToggle,
    handleComparisonModeChange,
    clearFilters
  ]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-blue-500 text-white rounded-t-lg">
        <CardTitle>Advanced SLA & Ticket Trends</CardTitle>
        <CardDescription className="text-blue-100">
          Detailed analysis and performance metrics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <FilterCard {...filterCardProps} />

        <Tabs
          defaultValue="trends"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trends">Ticket Trends</TabsTrigger>
              <TabsTrigger value="sla">SLA Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trends" className="mt-0 p-6">
            <TicketTrendAnalysis filters={filters} />
          </TabsContent>

          <TabsContent value="sla" className="mt-0 p-6">
            <SLADashboard filters={filters} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

AdvancedAnalyticsSection.displayName = "AdvancedAnalyticsSection";
