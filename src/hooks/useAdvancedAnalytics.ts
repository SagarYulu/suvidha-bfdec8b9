
import { useQuery } from "@tanstack/react-query";
import { AdvancedFilters } from "@/components/admin/analytics/types";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
}

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  return useQuery({
    queryKey: ['advancedAnalytics', filters],
    queryFn: async (): Promise<AnalyticsData> => {
      // Create a date range filter for Supabase queries
      const startDate = filters.dateRange.from?.toISOString();
      const endDate = filters.dateRange.to?.toISOString();
      
      // Base query modifiers for all queries
      let queryModifiers = supabase
        .from('issues')
        .select('*', { count: 'exact' });
        
      if (startDate) {
        queryModifiers = queryModifiers.gte('created_at', startDate);
      }
      
      if (endDate) {
        queryModifiers = queryModifiers.lte('created_at', endDate);
      }
      
      // Apply filters
      if (filters.city) {
        // Assuming issues are linked to employees and employees have city
        const { data: employeeIds } = await supabase
          .from('employees')
          .select('id')
          .eq('city', filters.city);
          
        if (employeeIds && employeeIds.length > 0) {
          const empIds = employeeIds.map(e => e.id);
          queryModifiers = queryModifiers.in('employee_uuid', empIds);
        }
      }
      
      if (filters.cluster) {
        // Similar approach for cluster filter
        const { data: employeeIds } = await supabase
          .from('employees')
          .select('id')
          .eq('cluster', filters.cluster);
          
        if (employeeIds && employeeIds.length > 0) {
          const empIds = employeeIds.map(e => e.id);
          queryModifiers = queryModifiers.in('employee_uuid', empIds);
        }
      }
      
      if (filters.manager) {
        // For manager filter
        const { data: employeeIds } = await supabase
          .from('employees')
          .select('id')
          .eq('manager', filters.manager);
          
        if (employeeIds && employeeIds.length > 0) {
          const empIds = employeeIds.map(e => e.id);
          queryModifiers = queryModifiers.in('employee_uuid', empIds);
        }
      }
      
      if (filters.issueType) {
        queryModifiers = queryModifiers.eq('type_id', filters.issueType);
      }
      
      // Get total tickets count
      const { count: totalTickets } = await queryModifiers;
      
      // Get resolved tickets
      const { count: resolvedTickets } = await queryModifiers
        .eq('status', 'closed');
        
      // Get open tickets
      const { count: openTickets } = await queryModifiers
        .neq('status', 'closed');
      
      return {
        totalTickets: totalTickets || 0,
        resolvedTickets: resolvedTickets || 0,
        openTickets: openTickets || 0
      };
    },
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
