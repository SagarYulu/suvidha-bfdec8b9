
import { Issue, IssueComment } from "@/types";
import { MOCK_ISSUES } from "@/data/mockData";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "@/services/userService";

// Helper function to convert database issue to app Issue type
const mapDbIssueToAppIssue = (dbIssue: any, comments: IssueComment[] = []): Issue => {
  return {
    id: dbIssue.id,
    userId: dbIssue.user_id,
    typeId: dbIssue.type_id,
    subTypeId: dbIssue.sub_type_id,
    description: dbIssue.description,
    status: dbIssue.status,
    priority: dbIssue.priority,
    createdAt: dbIssue.created_at,
    updatedAt: dbIssue.updated_at,
    closedAt: dbIssue.closed_at || undefined,
    assignedTo: dbIssue.assigned_to || undefined,
    comments: comments,
  };
};

// Helper function to convert app IssueComment to database format
const mapAppCommentToDbComment = (comment: Omit<IssueComment, 'id' | 'createdAt'>, issueId: string) => {
  return {
    issue_id: issueId,
    user_id: comment.userId,
    content: comment.content
  };
};

// Helper function to log audit trail
const logAuditTrail = async (
  issueId: string, 
  userId: string, 
  action: string, 
  previousStatus?: string, 
  newStatus?: string,
  details?: any
) => {
  try {
    await supabase.from('issue_audit_trail').insert({
      issue_id: issueId,
      user_id: userId,
      action,
      previous_status: previousStatus,
      new_status: newStatus,
      details
    });
    console.log(`Audit trail logged: ${action} for issue ${issueId}`);
  } catch (error) {
    console.error('Error logging audit trail:', error);
  }
};

// Check if we need to migrate localStorage issues to the database
const migrateLocalStorageIssuesToDb = async () => {
  const migrationDone = localStorage.getItem('issuesMigrationDone');
  if (migrationDone) return;
  
  const storedIssues = localStorage.getItem('issues');
  if (!storedIssues) {
    localStorage.setItem('issuesMigrationDone', 'true');
    return;
  }
  
  try {
    const issues = JSON.parse(storedIssues);
    console.log('Migrating issues from localStorage to database:', issues.length);
    
    for (const issue of issues) {
      // Check if issue already exists to avoid duplicates
      const { data: existingIssue } = await supabase
        .from('issues')
        .select('id')
        .eq('id', issue.id)
        .single();
      
      if (!existingIssue) {
        // Insert the issue
        const { data: newIssue, error } = await supabase.from('issues').insert({
          id: issue.id,
          user_id: issue.userId,
          type_id: issue.typeId,
          sub_type_id: issue.subTypeId,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          created_at: issue.createdAt,
          updated_at: issue.updatedAt,
          closed_at: issue.closedAt,
          assigned_to: issue.assignedTo
        }).select().single();
        
        if (error) {
          console.error('Error migrating issue:', error);
          continue;
        }
        
        // Add audit trail for migration
        await logAuditTrail(
          issue.id,
          'system',
          'migrated_from_local_storage',
          undefined,
          issue.status,
          { source: 'localStorage' }
        );
        
        // Migrate comments if any
        if (issue.comments && issue.comments.length > 0) {
          const commentsToInsert = issue.comments.map(comment => ({
            id: comment.id,
            issue_id: issue.id,
            user_id: comment.userId,
            content: comment.content,
            created_at: comment.createdAt
          }));
          
          const { error: commentsError } = await supabase
            .from('issue_comments')
            .insert(commentsToInsert);
          
          if (commentsError) {
            console.error('Error migrating comments:', commentsError);
          }
        }
      }
    }
    
    localStorage.setItem('issuesMigrationDone', 'true');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Failed to migrate issues:', error);
  }
};

// Try to migrate on service initialization
migrateLocalStorageIssuesToDb();

export const getIssues = async (): Promise<Issue[]> => {
  try {
    // Get all issues from the database
    const { data: dbIssues, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching issues:', error);
      return [];
    }
    
    // Get all comments for these issues
    const issueIds = dbIssues.map(issue => issue.id);
    const { data: dbComments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .in('issue_id', issueIds)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Group comments by issue_id
    const commentsByIssueId: Record<string, IssueComment[]> = {};
    
    if (dbComments) {
      dbComments.forEach(comment => {
        const issueId = comment.issue_id;
        if (!commentsByIssueId[issueId]) {
          commentsByIssueId[issueId] = [];
        }
        
        commentsByIssueId[issueId].push({
          id: comment.id,
          userId: comment.user_id,
          content: comment.content,
          createdAt: comment.created_at
        });
      });
    }
    
    // Map database issues to app Issue type with comments
    const issues = dbIssues.map(dbIssue => 
      mapDbIssueToAppIssue(dbIssue, commentsByIssueId[dbIssue.id] || [])
    );
    
    return issues;
  } catch (error) {
    console.error('Error in getIssues:', error);
    return [];
  }
};

export const getIssuesByUserId = async (userId: string): Promise<Issue[]> => {
  try {
    // Get user issues from the database
    const { data: dbIssues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user issues:', error);
      return [];
    }
    
    // Get all comments for these issues
    const issueIds = dbIssues.map(issue => issue.id);
    
    if (issueIds.length === 0) {
      return [];
    }
    
    const { data: dbComments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .in('issue_id', issueIds)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Group comments by issue_id
    const commentsByIssueId: Record<string, IssueComment[]> = {};
    
    if (dbComments) {
      dbComments.forEach(comment => {
        const issueId = comment.issue_id;
        if (!commentsByIssueId[issueId]) {
          commentsByIssueId[issueId] = [];
        }
        
        commentsByIssueId[issueId].push({
          id: comment.id,
          userId: comment.user_id,
          content: comment.content,
          createdAt: comment.created_at
        });
      });
    }
    
    // Map database issues to app Issue type with comments
    const issues = dbIssues.map(dbIssue => 
      mapDbIssueToAppIssue(dbIssue, commentsByIssueId[dbIssue.id] || [])
    );
    
    return issues;
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};

export const getIssueById = async (id: string): Promise<Issue | undefined> => {
  try {
    // Get the issue from the database
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching issue by ID:', error);
      return undefined;
    }
    
    // Get comments for this issue
    const { data: dbComments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .eq('issue_id', id)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Map comments to app IssueComment type
    const comments: IssueComment[] = dbComments ? dbComments.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at
    })) : [];
    
    // Map database issue to app Issue type
    return mapDbIssueToAppIssue(dbIssue, comments);
  } catch (error) {
    console.error('Error in getIssueById:', error);
    return undefined;
  }
};

export const createIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Issue> => {
  try {
    // Insert issue into the database
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .insert({
        user_id: issue.userId,
        type_id: issue.typeId,
        sub_type_id: issue.subTypeId,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assigned_to: issue.assignedTo
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
    
    // Log audit trail
    await logAuditTrail(
      dbIssue.id,
      issue.userId,
      'issue_created',
      undefined,
      dbIssue.status,
      { issue_type: issue.typeId, priority: issue.priority }
    );
    
    // Return the created issue in app Issue format
    return mapDbIssueToAppIssue(dbIssue, []);
  } catch (error) {
    console.error('Error in createIssue:', error);
    throw error;
  }
};

export const updateIssueStatus = async (id: string, status: Issue['status']): Promise<Issue | undefined> => {
  try {
    // First get the current issue to capture previous status
    const { data: currentIssue, error: fetchError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current issue:', fetchError);
      return undefined;
    }
    
    const previousStatus = currentIssue.status;
    const now = new Date().toISOString();
    const updateData: any = {
      status,
      updated_at: now
    };
    
    // If status is 'closed', update the closed_at timestamp
    if (status === 'closed') {
      updateData.closed_at = now;
    }
    
    // Update the issue in the database
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating issue status:', error);
      return undefined;
    }
    
    // Log audit trail for status change
    await logAuditTrail(
      id,
      'system', // Ideally should be the currently logged-in user ID
      'status_changed',
      previousStatus,
      status,
      { timestamp: now }
    );
    
    // Get comments for this issue to include in the returned Issue object
    const { data: dbComments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .eq('issue_id', id)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Map comments to app IssueComment type
    const comments: IssueComment[] = dbComments ? dbComments.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at
    })) : [];
    
    // Map database issue to app Issue type and include comments
    return mapDbIssueToAppIssue(dbIssue, comments);
  } catch (error) {
    console.error('Error in updateIssueStatus:', error);
    return undefined;
  }
};

export const addComment = async (issueId: string, comment: Omit<IssueComment, 'id' | 'createdAt'>): Promise<Issue | undefined> => {
  try {
    // Insert comment into the database
    const { data: dbComment, error } = await supabase
      .from('issue_comments')
      .insert(mapAppCommentToDbComment(comment, issueId))
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return undefined;
    }
    
    // Update issue's updatedAt timestamp
    const { error: updateError } = await supabase
      .from('issues')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', issueId);
    
    if (updateError) {
      console.error('Error updating issue timestamp:', updateError);
    }
    
    // Log audit trail for adding comment
    await logAuditTrail(
      issueId,
      comment.userId,
      'comment_added',
      undefined,
      undefined,
      { comment_id: dbComment.id }
    );
    
    // Return the updated issue with all comments
    return getIssueById(issueId);
  } catch (error) {
    console.error('Error in addComment:', error);
    return undefined;
  }
};

export const getIssueTypeLabel = (typeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  return issueType?.label || typeId;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  const subType = issueType?.subTypes.find(subType => subType.id === subTypeId);
  return subType?.label || subTypeId;
};

export const getAnalytics = async () => {
  try {
    // Get all issues for analytics
    const { data: dbIssues, error } = await supabase
      .from('issues')
      .select('*');
    
    if (error) {
      console.error('Error fetching issues for analytics:', error);
      return {
        totalIssues: 0,
        resolvedIssues: 0,
        openIssues: 0,
        resolutionRate: 0,
        avgResolutionTime: '0',
        cityCounts: {},
        clusterCounts: {},
        managerCounts: {},
        typeCounts: {},
      };
    }
    
    // Map raw DB issues to our application Issue type
    const issues = dbIssues.map(dbIssue => ({
      ...mapDbIssueToAppIssue(dbIssue),
      // Ensure these properties exist for analytics calculations
      closedAt: dbIssue.closed_at,
      userId: dbIssue.user_id,
      typeId: dbIssue.type_id,
    }));
    
    // Calculate various analytics based on the issues data
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === "closed" || i.status === "resolved").length;
    const openIssues = totalIssues - resolvedIssues;
    
    // Average resolution time (for closed issues)
    const closedIssues = issues.filter(i => i.closedAt);
    let avgResolutionTime = 0;
    
    if (closedIssues.length > 0) {
      const totalResolutionTime = closedIssues.reduce((total, issue) => {
        const createdDate = new Date(issue.createdAt);
        const closedDate = new Date(issue.closedAt!);
        const timeDiff = closedDate.getTime() - createdDate.getTime();
        return total + timeDiff;
      }, 0);
      
      avgResolutionTime = totalResolutionTime / closedIssues.length / (1000 * 60 * 60); // hours
    }
    
    // Fetch user data to correctly map manager information
    const users = await getUsers();
    
    // City-wise issues
    const cityCounts: Record<string, number> = {};
    // Cluster-wise issues
    const clusterCounts: Record<string, number> = {};
    // Manager-wise issues - fixed to use real user data
    const managerCounts: Record<string, number> = {};
    // Issue type distribution
    const typeCounts: Record<string, number> = {};
    
    // Process each issue and map it to the correct user data
    issues.forEach(issue => {
      // Find the user who created this issue
      const user = users.find(u => u.id === issue.userId);
      
      if (user) {
        // Use actual user data for analytics
        const city = user.city || "Unknown";
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        
        const cluster = user.cluster || "Unknown";
        clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
        
        // Use the actual manager name from user data
        const manager = user.manager || "Unassigned";
        managerCounts[manager] = (managerCounts[manager] || 0) + 1;
      } else {
        // Fallback for issues without valid user data
        cityCounts["Unknown"] = (cityCounts["Unknown"] || 0) + 1;
        clusterCounts["Unknown"] = (clusterCounts["Unknown"] || 0) + 1;
        managerCounts["Unassigned"] = (managerCounts["Unassigned"] || 0) + 1;
      }
      
      // Real issue type data
      typeCounts[issue.typeId] = (typeCounts[issue.typeId] || 0) + 1;
    });
    
    // Get audit trail data for advanced analytics if needed
    const { data: auditTrailData, error: auditError } = await supabase
      .from('issue_audit_trail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Get last 100 audit events
    
    if (auditError) {
      console.error('Error fetching audit trail:', auditError);
    } else {
      console.log('Recent audit trail entries:', auditTrailData.length);
    }
    
    return {
      totalIssues,
      resolvedIssues,
      openIssues,
      resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0,
      avgResolutionTime: avgResolutionTime.toFixed(2),
      cityCounts,
      clusterCounts,
      managerCounts,
      typeCounts,
      // Include audit trail summary if needed
      recentActivity: auditTrailData || []
    };
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    return {
      totalIssues: 0,
      resolvedIssues: 0,
      openIssues: 0,
      resolutionRate: 0,
      avgResolutionTime: '0',
      cityCounts: {},
      clusterCounts: {},
      managerCounts: {},
      typeCounts: {},
    };
  }
};
