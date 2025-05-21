
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterCard } from "./FilterCard";
import { useAnalyticsFilters } from "./useAnalyticsFilters";
import { TicketTrendAnalysis } from "./TicketTrendAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SLADashboard } from "./SLADashboard";

interface AdvancedAnalyticsSectionProps {
  onFilterChange?: (filters: any) => void; // New prop to pass filters up to parent
}

export const AdvancedAnalyticsSection = ({ onFilterChange }: AdvancedAnalyticsSectionProps) => {
  const [activeTab, setActiveTab] = useState("trends");
  const {
    filters,
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
    clearFilters,
  } = useAnalyticsFilters();

  // Effect to pass filters up to parent when they change
  const handleFilterUpdate = () => {
    if (onFilterChange) {
      console.log("Passing filters up from AdvancedAnalyticsSection:", filters);
      onFilterChange(filters);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Whenever any filter changes, call the handlers
  const onCityChange = (city: string) => {
    handleCityChange(city);
    handleFilterUpdate();
  };
  
  const onClusterChange = (cluster: string) => {
    handleClusterChange(cluster);
    handleFilterUpdate();
  };
  
  const onManagerChange = (manager: string) => {
    handleManagerChange(manager);
    handleFilterUpdate();
  };
  
  const onRoleChange = (role: string) => {
    handleRoleChange(role);
    handleFilterUpdate();
  };
  
  const onIssueTypeChange = (issueType: string) => {
    handleIssueTypeChange(issueType);
    handleFilterUpdate();
  };
  
  const onDateRangeChange = (dateRange: any) => {
    handleDateRangeChange(dateRange);
    handleFilterUpdate();
  };
  
  const onComparisonModeToggle = (enabled: boolean) => {
    handleComparisonModeToggle(enabled);
    handleFilterUpdate();
  };
  
  const onComparisonModeChange = (mode: string) => {
    handleComparisonModeChange(mode);
    handleFilterUpdate();
  };
  
  const onClearFilters = () => {
    clearFilters();
    handleFilterUpdate();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-blue-500 text-white rounded-t-lg">
        <CardTitle>Advanced SLA & Ticket Trends</CardTitle>
        <CardDescription className="text-blue-100">
          Detailed analysis and performance metrics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <FilterCard
          filters={filters}
          availableClusters={availableClusters}
          activeFiltersCount={activeFiltersCount}
          onCityChange={onCityChange}
          onClusterChange={onClusterChange}
          onManagerChange={onManagerChange}
          onRoleChange={onRoleChange}
          onIssueTypeChange={onIssueTypeChange}
          onDateRangeChange={onDateRangeChange}
          onComparisonModeToggle={onComparisonModeToggle}
          onComparisonModeChange={onComparisonModeChange}
          onClearFilters={onClearFilters}
        />

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
};
