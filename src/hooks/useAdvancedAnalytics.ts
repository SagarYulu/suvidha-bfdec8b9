
import { useQuery } from "@tanstack/react-query";
import { AdvancedFilters } from "@/components/admin/analytics/types";

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  return useQuery({
    queryKey: ['advancedAnalytics', filters],
    queryFn: async () => {
      // Return a simple object since charts have been removed
      return { disabled: true };
    },
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
