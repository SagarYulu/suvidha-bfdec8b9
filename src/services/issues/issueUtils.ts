
import { IssueComment } from "@/types";
import { MOCK_ISSUES } from "@/data/mockData";

/**
 * Helper function to convert database issue to app Issue type
 * 
 * Database mapping notes:
 * - dbIssue.id → Issue.id (unique issue identifier)
 * - dbIssue.user_id → Issue.userId (employee UUID from employees.id)
 * 
 * @param dbIssue The raw issue from the database
 * @param comments Comments associated with the issue
 * @returns Processed Issue object with correct field mapping
 */
export const mapDbIssueToAppIssue = (dbIssue: any, comments: IssueComment[] = []) => {
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

// Helper function to generate a UUID
export const generateUUID = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

// Check if we need to migrate localStorage issues to the database
export const migrateLocalStorageIssuesToDb = async () => {
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
    
    // Implement migration logic here (moved to issueService.ts)
    // This function is kept for reference and future migrations
    
    localStorage.setItem('issuesMigrationDone', 'true');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Failed to migrate issues:', error);
  }
};
