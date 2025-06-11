
import { IssueComment } from '@/types';

// Mock comments data
const mockComments: IssueComment[] = [
  {
    id: 'comment-1',
    employeeUuid: 'emp-001',
    content: 'Issue reported and assigned to technical team',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const fetchIssueComments = async (issueId: string): Promise<IssueComment[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: 'comment-1',
      employeeUuid: 'emp-001',
      content: 'Issue reported and under review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'comment-2', 
      employeeUuid: 'emp-002',
      content: 'Assigned to technical team for resolution',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

export const addIssueComment = async (
  issueId: string, 
  employeeUuid: string, 
  content: string
): Promise<IssueComment> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newComment: IssueComment = {
    id: `comment-${Date.now()}`,
    employeeUuid,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockComments.push(newComment);
  return newComment;
};

// Unified addComment function that accepts the commentData object
export const addComment = async (
  issueId: string, 
  commentData: { employeeUuid: string; content: string },
  userId?: string
): Promise<IssueComment> => {
  return addIssueComment(issueId, commentData.employeeUuid, commentData.content);
};

// Export alias for backward compatibility
export const addNewComment = addIssueComment;
