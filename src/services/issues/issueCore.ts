
// This file is now a lightweight entry point that re-exports from the modularized services
// This allows us to maintain backwards compatibility with existing imports

// Initialize service
const initializeService = () => {
  console.log("Issue core service initialized");
};
initializeService();

// Import all the functions we need from their respective services
import { processIssues } from "./issueProcessingService";
import { getIssueById, getIssuesByUserId, getAssignedIssues } from "./issueFetchService";
import { createIssue } from "./issueCreationService";
import { updateIssueStatus } from "./issueStatusService";
import { assignIssueToUser } from "./issueAssignmentService";
import { reopenTicket } from "./issueReopeningService";
import { updateIssuePriority, updateAllIssuePriorities } from "./priorityUpdateService";
import { Issue } from "@/types";

// Re-export the functions from the modularized services
export { processIssues } from "./issueProcessingService";
export { getIssueById, getIssuesByUserId, getAssignedIssues } from "./issueFetchService";
export { createIssue } from "./issueCreationService";
export { updateIssueStatus } from "./issueStatusService";
export { assignIssueToUser } from "./issueAssignmentService";
export { reopenTicket } from "./issueReopeningService";
export { updateIssuePriority, updateAllIssuePriorities } from "./priorityUpdateService";

// Re-export Issue type from types
export type { Issue as IssueType } from "@/types";

// Add a fetchUserIssues function that uses the imported getIssuesByUserId 
export const fetchUserIssues = async (userId: string) => {
  return await getIssuesByUserId(userId);
};
