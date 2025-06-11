
import { Issue } from '@/types';
import { mapDbIssueToAppIssue } from './issueUtils';

export const formatConsistentIssueData = (issues: Issue[]): Issue[] => {
  return issues.map(issue => ({
    id: issue.id,
    employeeUuid: issue.employeeUuid,
    typeId: issue.typeId || 'UNKNOWN',
    subTypeId: issue.subTypeId || 'UNKNOWN',
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    closedAt: issue.closedAt || '',
    assignedTo: issue.assignedTo || '',
    comments: issue.comments || [],
    title: issue.title || 'Untitled Issue',
    issueType: issue.issueType || 'General',
    employeeId: issue.employeeId || issue.employeeUuid
  }));
};

export const processIssues = (rawIssues: any[]): Issue[] => {
  return rawIssues.map(mapDbIssueToAppIssue);
};
