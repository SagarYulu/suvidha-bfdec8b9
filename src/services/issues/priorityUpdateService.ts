import { Issue } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Mock issues for testing - will be replaced with actual Supabase calls
let mockIssues: Issue[] = [];

export const updateIssuePriority = async (
  issueId: string, 
  newPriority: 'low' | 'medium' | 'high' | 'urgent'
): Promise<boolean> => {
  try {
    console.log(`Updating issue ${issueId} priority to ${newPriority}`);
    
    // Update in Supabase
    const { error } = await supabase
      .from('issues')
      .update({ priority: newPriority })
      .eq('id', issueId);

    if (error) {
      console.error('Error updating issue priority:', error);
      return false;
    }

    // Update in mock data as fallback
    const issueIndex = mockIssues.findIndex(issue => issue.id === issueId);
    if (issueIndex !== -1) {
      mockIssues[issueIndex].priority = newPriority;
    }

    return true;
  } catch (error) {
    console.error('Error updating issue priority:', error);
    return false;
  }
};

export const updateAllIssuePriorities = async (): Promise<{ updated: number; errors: string[] }> => {
  try {
    console.log('Starting bulk priority update for all issues...');
    
    // Fetch all issues
    const { data: issues, error: fetchError } = await supabase
      .from('issues')
      .select('id, type_id, sub_type_id, priority');

    if (fetchError) {
      console.error('Error fetching issues:', fetchError);
      return { updated: 0, errors: [fetchError.message] };
    }

    if (!issues || issues.length === 0) {
      console.log('No issues found to update');
      return { updated: 0, errors: [] };
    }

    let updated = 0;
    const errors: string[] = [];

    // Process issues in batches
    for (const issue of issues) {
      if (issue.priority === 'urgent') {
        continue; // Skip if already at correct priority levels
      }

      const newPriority = mapIssuePriority(issue.type_id, issue.sub_type_id);
      
      if (newPriority !== issue.priority) {
        const success = await updateIssuePriority(issue.id, newPriority);
        if (success) {
          updated++;
        } else {
          errors.push(`Failed to update issue ${issue.id}`);
        }
      }
    }

    console.log(`Bulk priority update completed. Updated: ${updated}, Errors: ${errors.length}`);
    return { updated, errors };
  } catch (error) {
    console.error('Error in bulk priority update:', error);
    return { updated: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
};

export const mapIssuePriority = (typeId: string, subTypeId: string): 'low' | 'medium' | 'high' | 'urgent' => {
  // Emergency cases
  if (typeId === 'IT_SUPPORT' && subTypeId === 'SYSTEM_DOWN') {
    return 'urgent';
  }
  
  if (typeId === 'PAYROLL' && subTypeId === 'SALARY_NOT_CREDITED') {
    return 'urgent';
  }

  // High priority cases
  if (typeId === 'LEAVE' && subTypeId === 'URGENT_LEAVE') {
    return 'high';
  }
  
  if (typeId === 'IT_SUPPORT' && (subTypeId === 'EMAIL_ISSUE' || subTypeId === 'VPN_ISSUE')) {
    return 'high';
  }

  // Medium priority cases
  if (typeId === 'PAYROLL' || typeId === 'BENEFITS') {
    return 'medium';
  }

  // Default to low priority
  return 'low';
};

// Mock data initialization
const initializeMockIssues = () => {
  if (mockIssues.length === 0) {
    mockIssues = [
      {
        id: 'issue-1',
        employeeUuid: 'emp-001',
        typeId: 'IT_SUPPORT',
        subTypeId: 'SYSTEM_DOWN',
        description: 'System is completely down',
        status: 'open' as const,
        priority: 'urgent' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        closedAt: '',
        assignedTo: '',
        comments: [],
        title: 'System Down',
        issueType: 'IT Support',
        employeeId: 'EMP001',
        attachmentUrl: '',
        attachments: []
      }
    ];
  }
};

// Initialize mock data
initializeMockIssues();

</edits_to_apply>
