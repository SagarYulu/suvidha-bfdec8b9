
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { FilterCard } from "./FilterCard";
import { SectionHeader } from "./SectionHeader";
import { useAnalyticsFilters, COMPARISON_MODES } from "./useAnalyticsFilters";
import { AnalyticsPlaceholder } from "./AnalyticsPlaceholder";
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { SLADashboard } from "./SLADashboard";
import { TicketTrendAnalysis } from "./TicketTrendAnalysis";
import { toast } from "sonner";

// Re-export AdvancedFilters type so imports don't break elsewhere
export type { AdvancedFilters } from "./types";
export type { DateRange } from "./DateRangePicker";

export const AdvancedAnalyticsSection = () => {
  const {
    filters,
    pendingFilters,
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
    applyFilters,
    clearFilters,
  } = useAnalyticsFilters();

  const { isLoading, error, data } = useAdvancedAnalytics(filters);

  return (
    <div className="space-y-6 mt-8">
      <SectionHeader 
        activeFiltersCount={activeFiltersCount} 
        onClearFilters={clearFilters} 
      />

      <FilterCard 
        filters={pendingFilters}
        handleCityChange={handleCityChange}
        handleClusterChange={handleClusterChange}
        handleManagerChange={handleManagerChange}
        handleRoleChange={handleRoleChange}
        handleIssueTypeChange={handleIssueTypeChange}
        handleDateRangeChange={handleDateRangeChange}
        handleComparisonModeToggle={handleComparisonModeToggle}
        handleComparisonModeChange={handleComparisonModeChange}
        applyFilters={() => {
          applyFilters();
          toast.success("Filters applied successfully");
        }}
        availableClusters={availableClusters}
        managers={managers}
        comparisonModes={COMPARISON_MODES}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">Please try again or adjust your filters</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">SLA Performance Dashboard</h3>
            <SLADashboard filters={filters} />
          </div>

          <div className="mb-6">
            <TicketTrendAnalysis filters={filters} />
          </div>

          <AnalyticsPlaceholder />
        </>
      )}
    </div>
  );
};
