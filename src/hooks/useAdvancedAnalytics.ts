
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdvancedFilters } from "@/components/admin/analytics/AdvancedAnalyticsSection";
import { getIssues } from "@/services/issues/issueFilters";
import { format, subDays, parseISO, startOfDay, endOfDay, addDays } from "date-fns";

interface AdvancedAnalyticsData {
  slaComplianceRate: number;
  mttr: number; // Mean Time To Resolution
  mttrTrend: number; // % change from previous period
  firstResponseTime: number;
  firstResponseTimeTrend: number; // % change from previous period
  slaComplianceTrend: Array<{
    date: string;
    rate: number;
  }>;
  resolutionTimeTrend: Array<{
    date: string;
    hours: number;
  }>;
  ticketsByPriority: Array<{
    priority: string;
    count: number;
  }>;
  statusTrend: Array<{
    date: string;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
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
        
        // Generate trend data based on comparison mode
        const slaComplianceTrend = generateSampleTrendData(7);
        const resolutionTimeTrend = generateSampleTrendData(7);
        
        // Generate ticket counts by priority
        const ticketsByPriority = [
          { priority: 'Low', count: finalFilteredIssues.filter(i => i.priority === 'low').length },
          { priority: 'Medium', count: finalFilteredIssues.filter(i => i.priority === 'medium').length },
          { priority: 'High', count: finalFilteredIssues.filter(i => i.priority === 'high').length },
          { priority: 'Critical', count: finalFilteredIssues.filter(i => i.priority === 'critical').length }
        ];
        
        // Generate status trend data
        const statusTrend = generateStatusTrendData(7);
        
        // For now, return placeholder trend values
        // In a real implementation, these would be calculated based on actual data
        const mttrTrend = -5.2; // 5.2% improvement
        const firstResponseTimeTrend = 2.1; // 2.1% slower
        
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

// Helper function to generate sample trend data for initial implementation
function generateSampleTrendData(days: number) {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'MMM dd');
    
    // Generate random values for initial implementation
    // In a real implementation, these would be calculated from actual data
    result.push({
      date: dateStr,
      rate: Math.floor(Math.random() * 40) + 60, // Random between 60-100
      hours: Math.floor(Math.random() * 10) + 5 // Random between 5-15
    });
  }
  
  return result;
}

// Helper function to generate sample status trend data
function generateStatusTrendData(days: number) {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'MMM dd');
    
    // Generate random values for initial implementation
    result.push({
      date: dateStr,
      open: Math.floor(Math.random() * 10) + 5,
      in_progress: Math.floor(Math.random() * 15) + 10,
      resolved: Math.floor(Math.random() * 20) + 15,
      closed: Math.floor(Math.random() * 10) + 5
    });
  }
  
  return result;
}
