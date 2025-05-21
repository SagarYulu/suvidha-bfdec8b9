
import { Separator } from "@/components/ui/separator";
import { FilterCard } from "./FilterCard";
import { SectionHeader } from "./SectionHeader";
import { useAnalyticsFilters, COMPARISON_MODES } from "./useAnalyticsFilters";
import { AnalyticsPlaceholder } from "./AnalyticsPlaceholder";
import { AdvancedFilters } from "./types";
import { AdvancedAnalyticsCharts } from "./AdvancedAnalyticsCharts";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";

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

  const { data: analyticsData, isLoading, error } = useAdvancedAnalytics(filters);

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

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          <p>Error loading analytics data. Please try again later.</p>
        </div>
      ) : !analyticsData ? (
        <AnalyticsPlaceholder />
      ) : (
        <AdvancedAnalyticsCharts filters={filters} />
      )}
    </div>
  );
};
