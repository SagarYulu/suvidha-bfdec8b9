
import { Separator } from "@/components/ui/separator";
import { FilterCard } from "./FilterCard";
import { SectionHeader } from "./SectionHeader";
import { useAnalyticsFilters, COMPARISON_MODES } from "./useAnalyticsFilters";
import { AnalyticsPlaceholder } from "./AnalyticsPlaceholder";
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { SLADashboard } from "./SLADashboard";
import { TicketTrendAnalysis } from "./TicketTrendAnalysis";

// Re-export AdvancedFilters type so imports don't break elsewhere
export type { AdvancedFilters } from "./types";
export type { DateRange } from "./DateRangePicker";

export const AdvancedAnalyticsSection = () => {
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
    clearFilters,
  } = useAnalyticsFilters();

  const { isLoading, error } = useAdvancedAnalytics(filters);

  return (
    <div className="space-y-6 mt-8">
      <SectionHeader 
        activeFiltersCount={activeFiltersCount} 
        onClearFilters={clearFilters} 
      />

      <FilterCard 
        filters={filters}
        handleCityChange={handleCityChange}
        handleClusterChange={handleClusterChange}
        handleManagerChange={handleManagerChange}
        handleRoleChange={handleRoleChange}
        handleIssueTypeChange={handleIssueTypeChange}
        handleDateRangeChange={handleDateRangeChange}
        handleComparisonModeToggle={handleComparisonModeToggle}
        handleComparisonModeChange={handleComparisonModeChange}
        availableClusters={availableClusters}
        managers={managers}
        comparisonModes={COMPARISON_MODES}
      />

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">SLA Performance Dashboard</h3>
        <SLADashboard filters={filters} />
      </div>

      {/* Add the Ticket Trend Analysis section */}
      <TicketTrendAnalysis filters={filters} />
    </div>
  );
};
