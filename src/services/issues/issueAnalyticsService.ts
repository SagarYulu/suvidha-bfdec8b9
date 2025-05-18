
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { getEffectiveIssueType } from "./issueMappingService";

// Define analytics result type
interface AnalyticsResult {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  byType: Record<string, number>;
  bySubType: Record<string, number>;
  byDay: Record<string, number>;
  averageResolutionTime: number | null;
}

// Get analytics from issues
export const getAnalytics = async (): Promise<AnalyticsResult> => {
  try {
    // Fetch all issues
    const { data: issues, error } = await supabase
      .from('issues')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Convert database records to Issue objects with proper type casting
    const formattedIssues: Issue[] = issues.map(record => ({
      id: record.id,
      employeeUuid: record.employee_uuid,
      typeId: record.type_id,
      subTypeId: record.sub_type_id,
      description: record.description,
      status: record.status as Issue["status"],  // Cast to the correct union type
      priority: record.priority as Issue["priority"],  // Cast to the correct union type
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      closedAt: record.closed_at,
      assignedTo: record.assigned_to,
      comments: [],
      attachmentUrl: record.attachment_url,
      attachments: record.attachments,
      mappedTypeId: record.mapped_type_id,
      mappedSubTypeId: record.mapped_sub_type_id,
      mappedAt: record.mapped_at,
      mappedBy: record.mapped_by
    }));
    
    // Initialize result
    const result: AnalyticsResult = {
      total: formattedIssues.length,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      byType: {},
      bySubType: {},
      byDay: {},
      averageResolutionTime: null
    };
    
    // Calculate average resolution time in hours
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    
    formattedIssues.forEach(issue => {
      // Count by status
      switch (issue.status) {
        case 'open':
          result.open++;
          break;
        case 'in_progress':
          result.in_progress++;
          break;
        case 'resolved':
          result.resolved++;
          break;
        case 'closed':
          result.closed++;
          break;
      }
      
      // Get the effective type and subtype (using mapped values if available)
      const { typeId, subTypeId } = getEffectiveIssueType(issue);
      
      // Count by type (using effective type)
      if (!result.byType[typeId]) {
        result.byType[typeId] = 0;
      }
      result.byType[typeId]++;
      
      // Count by subtype (with parent type, using effective values)
      const subTypeKey = `${typeId}:${subTypeId}`;
      if (!result.bySubType[subTypeKey]) {
        result.bySubType[subTypeKey] = 0;
      }
      result.bySubType[subTypeKey]++;
      
      // Count by day
      const day = new Date(issue.createdAt).toISOString().split('T')[0];
      if (!result.byDay[day]) {
        result.byDay[day] = 0;
      }
      result.byDay[day]++;
      
      // Calculate resolution time for resolved/closed issues
      if ((issue.status === 'resolved' || issue.status === 'closed') && issue.closedAt) {
        const createdDate = new Date(issue.createdAt).getTime();
        const closedDate = new Date(issue.closedAt).getTime();
        const resolutionTime = (closedDate - createdDate) / (1000 * 60 * 60); // in hours
        
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });
    
    // Calculate average resolution time
    if (resolvedCount > 0) {
      result.averageResolutionTime = totalResolutionTime / resolvedCount;
    }
    
    return result;
  } catch (error) {
    console.error('Error getting analytics:', error);
    // Return a default result instead of throwing error
    return {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      byType: {},
      bySubType: {},
      byDay: {},
      averageResolutionTime: null
    };
  }
};

// Function to get issue analytics by specific property (city, cluster, etc)
export const getAnalyticsByProperty = async (propertyName: string): Promise<Record<string, number>> => {
  try {
    // This would require joining issues with employees table to get properties
    // For now, this is a placeholder that would need to be implemented based on the schema
    return {};
  } catch (error) {
    console.error(`Error getting analytics by ${propertyName}:`, error);
    throw error;
  }
};
