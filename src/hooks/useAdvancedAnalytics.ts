
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdvancedFilters } from "@/components/admin/analytics/AdvancedAnalyticsSection";
import { getIssues } from "@/services/issues/issueFilters";
import { format, subDays, parseISO, startOfDay, endOfDay, addDays, subMonths, subWeeks, subQuarters, subYears } from "date-fns";

interface AdvancedAnalyticsData {
  slaComplianceRate: number;
  mttr: number; // Mean Time To Resolution
  mttrTrend: number; // % change from previous period
  firstResponseTime: number;
  firstResponseTimeTrend: number; // % change from previous period
  slaComplianceTrend: Array<{
    date: string;
    rate: number;
    comparisonRate?: number;
  }>;
  resolutionTimeTrend: Array<{
    date: string;
    hours: number;
    comparisonHours?: number;
  }>;
  ticketsByPriority: Array<{
    priority: string;
    count: number;
    comparisonCount?: number;
  }>;
  statusTrend: Array<{
    date: string;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    comparison?: {
      open: number;
      in_progress: number;
      resolved: number;
      closed: number;
    };
  }>;
}

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  return useQuery({
    queryKey: ['advancedAnalytics', filters],
    queryFn: async () => {
      try {
        console.log("Fetching advanced analytics with filters:", filters);
        
        // For initial implementation, we'll use the existing getIssues function
        // and process the data on the client side
        const allIssues = await getIssues({
          city: filters.city,
          cluster: filters.cluster,
          issueType: filters.issueType
        });
        
        console.log(`Retrieved ${allIssues.length} issues for advanced analytics`);
        
        if (allIssues.length === 0) {
          return null;
        }
        
        // Filter issues by date range if specified
        const filteredIssues = filters.dateRange.from && filters.dateRange.to
          ? allIssues.filter(issue => {
              const createdAt = new Date(issue.createdAt);
              return createdAt >= startOfDay(filters.dateRange.from!) && 
                     createdAt <= endOfDay(filters.dateRange.to!);
            })
          : allIssues;
            
        // Further filter by role and manager if specified
        const finalFilteredIssues = filteredIssues.filter(issue => {
          // Role filtering would require employee data lookup
          // Manager filtering would require employee data lookup
          // We'll implement these when we have the data relations set up
          return true;
        });

        // Get comparison date range if comparison mode is enabled
        let comparisonFilteredIssues: any[] = [];
        
        if (filters.isComparisonModeEnabled && filters.dateRange.from && filters.dateRange.to) {
          const from = new Date(filters.dateRange.from);
          const to = new Date(filters.dateRange.to);
          const diffTime = Math.abs(to.getTime() - from.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let comparisonFrom, comparisonTo;
          
          // Calculate comparison date range based on the selected mode
          switch (filters.comparisonMode) {
            case "day-by-day":
              comparisonFrom = subDays(from, diffDays);
              comparisonTo = subDays(to, diffDays);
              break;
            case "week-on-week":
              comparisonFrom = subWeeks(from, 1);
              comparisonTo = subWeeks(to, 1);
              break;
            case "month-on-month":
              comparisonFrom = subMonths(from, 1);
              comparisonTo = subMonths(to, 1);
              break;
            case "quarter-on-quarter":
              comparisonFrom = subQuarters(from, 1);
              comparisonTo = subQuarters(to, 1);
              break;
            case "year-on-year":
              comparisonFrom = subYears(from, 1);
              comparisonTo = subYears(to, 1);
              break;
          }
          
          comparisonFilteredIssues = allIssues.filter(issue => {
            const createdAt = new Date(issue.createdAt);
            return createdAt >= startOfDay(comparisonFrom) && 
                   createdAt <= endOfDay(comparisonTo);
          }).filter(issue => {
            // Apply the same role and manager filters
            return true;
          });
          
          console.log(`Retrieved ${comparisonFilteredIssues.length} comparison issues for ${filters.comparisonMode} comparison`);
        }
        
        // Process the data to derive insights
        
        // Calculate SLA compliance rate (placeholder calculation)
        // In a real implementation, this would compare resolution time against SLA targets
        const resolvedIssues = finalFilteredIssues.filter(
          issue => issue.status === 'resolved' || issue.status === 'closed'
        );
        
        const slaCompliantIssues = resolvedIssues.length * 0.8; // Placeholder: assuming 80% meet SLA
        const slaComplianceRate = resolvedIssues.length > 0 
          ? (slaCompliantIssues / resolvedIssues.length) * 100 
          : 0;
        
        // Calculate mean time to resolution
        let totalResolutionTime = 0;
        resolvedIssues.forEach(issue => {
          if (issue.createdAt && issue.updatedAt) {
            const createdAt = new Date(issue.createdAt);
            const resolvedAt = new Date(issue.updatedAt);
            const resolutionHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            totalResolutionTime += resolutionHours;
          }
        });
        
        const mttr = resolvedIssues.length > 0 
          ? totalResolutionTime / resolvedIssues.length 
          : 0;
        
        // Calculate first response time (placeholder)
        // In a real implementation, this would look at the first comment timestamp
        const firstResponseTime = 5.2; // Placeholder value
        
        // Handle comparison data calculations
        let mttrTrend = 0;
        let firstResponseTimeTrend = 0;
        
        if (filters.isComparisonModeEnabled && comparisonFilteredIssues.length > 0) {
          // Calculate comparison metrics
          const comparisonResolvedIssues = comparisonFilteredIssues.filter(
            issue => issue.status === 'resolved' || issue.status === 'closed'
          );
          
          let comparisonTotalResolutionTime = 0;
          comparisonResolvedIssues.forEach(issue => {
            if (issue.createdAt && issue.updatedAt) {
              const createdAt = new Date(issue.createdAt);
              const resolvedAt = new Date(issue.updatedAt);
              const resolutionHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
              comparisonTotalResolutionTime += resolutionHours;
            }
          });
          
          const comparisonMttr = comparisonResolvedIssues.length > 0 
            ? comparisonTotalResolutionTime / comparisonResolvedIssues.length 
            : 0;
          
          // Calculate trends (percentage change)
          mttrTrend = comparisonMttr > 0 
            ? ((mttr - comparisonMttr) / comparisonMttr) * 100 
            : 0;
            
          // Placeholder for first response time trend
          firstResponseTimeTrend = 2.1;
        } else {
          // If comparison mode is not enabled, use placeholder values
          mttrTrend = -5.2; // 5.2% improvement
          firstResponseTimeTrend = 2.1; // 2.1% slower
        }
        
        // Generate trend data - for real implementation, this would be based on actual data
        // Here we'll use placeholder data for demonstration
        const slaComplianceTrend = generateTrendData(7, filters.isComparisonModeEnabled);
        const resolutionTimeTrend = generateTrendData(7, filters.isComparisonModeEnabled);
        
        // Generate ticket counts by priority with comparison data if enabled
        const ticketsByPriority = [
          { 
            priority: 'Low', 
            count: finalFilteredIssues.filter(i => i.priority === 'low').length,
            comparisonCount: filters.isComparisonModeEnabled 
              ? comparisonFilteredIssues.filter(i => i.priority === 'low').length 
              : undefined
          },
          { 
            priority: 'Medium', 
            count: finalFilteredIssues.filter(i => i.priority === 'medium').length,
            comparisonCount: filters.isComparisonModeEnabled 
              ? comparisonFilteredIssues.filter(i => i.priority === 'medium').length 
              : undefined
          },
          { 
            priority: 'High', 
            count: finalFilteredIssues.filter(i => i.priority === 'high').length,
            comparisonCount: filters.isComparisonModeEnabled 
              ? comparisonFilteredIssues.filter(i => i.priority === 'high').length 
              : undefined
          },
          { 
            priority: 'Critical', 
            count: finalFilteredIssues.filter(i => i.priority === 'critical').length,
            comparisonCount: filters.isComparisonModeEnabled 
              ? comparisonFilteredIssues.filter(i => i.priority === 'critical').length 
              : undefined
          }
        ];
        
        // Generate status trend data with comparison data if enabled
        const statusTrend = generateStatusTrendData(7, filters.isComparisonModeEnabled);
        
        return {
          slaComplianceRate,
          mttr,
          mttrTrend,
          firstResponseTime,
          firstResponseTimeTrend,
          slaComplianceTrend,
          resolutionTimeTrend,
          ticketsByPriority,
          statusTrend
        };
      } catch (error) {
        console.error("Error in useAdvancedAnalytics:", error);
        throw error;
      }
    },
    enabled: !!filters.dateRange.from && !!filters.dateRange.to, // Only fetch if date range is set
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Helper function to generate trend data with optional comparison data
function generateTrendData(days: number, includeComparison: boolean) {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'MMM dd');
    
    // Generate random values for initial implementation
    const dataPoint: any = {
      date: dateStr,
      rate: Math.floor(Math.random() * 40) + 60, // Random between 60-100
      hours: Math.floor(Math.random() * 10) + 5 // Random between 5-15
    };
    
    // Add comparison data if enabled
    if (includeComparison) {
      dataPoint.comparisonRate = Math.floor(Math.random() * 40) + 60;
      dataPoint.comparisonHours = Math.floor(Math.random() * 10) + 5;
    }
    
    result.push(dataPoint);
  }
  
  return result;
}

// Helper function to generate status trend data with optional comparison data
function generateStatusTrendData(days: number, includeComparison: boolean) {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'MMM dd');
    
    // Generate random values for initial implementation
    const dataPoint: any = {
      date: dateStr,
      open: Math.floor(Math.random() * 10) + 5,
      in_progress: Math.floor(Math.random() * 15) + 10,
      resolved: Math.floor(Math.random() * 20) + 15,
      closed: Math.floor(Math.random() * 10) + 5
    };
    
    // Add comparison data if enabled
    if (includeComparison) {
      dataPoint.comparison = {
        open: Math.floor(Math.random() * 10) + 5,
        in_progress: Math.floor(Math.random() * 15) + 10,
        resolved: Math.floor(Math.random() * 20) + 15,
        closed: Math.floor(Math.random() * 10) + 5
      };
    }
    
    result.push(dataPoint);
  }
  
  return result;
}
