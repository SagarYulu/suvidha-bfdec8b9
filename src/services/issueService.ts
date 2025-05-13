
// This file is a facade that re-exports from the modularized services
// This maintains backwards compatibility while allowing a cleaner structure

// Re-export types
import { IssueFilters } from "./issues/issueFilters";
export type { IssueFilters };

// Re-export all the functions from the modular services
export { 
  getIssueById,
  getIssuesByUserId,
  createIssue,
  updateIssueStatus,
  assignIssueToUser,
  getAssignedIssues,
  reopenTicket,
  updateIssuePriority,
  updateAllIssuePriorities
} from "./issues/issueCore";

export {
  getIssues
} from "./issues/issueFilters";

export { 
  getIssueTypeLabel, 
  getIssueSubTypeLabel 
} from "./issues/issueTypeHelpers";

export { 
  addNewComment as addComment 
} from "./issues/issueCommentService";

export { 
  getAnalytics,
  getResolutionTimeTrends
} from "./issues/issueAnalyticsService";

export {
  getEmployeeNameByUuid,
  mapEmployeeUuidsToNames
} from "./issues/issueUtils";

// Export the formatting utilities
export {
  formatConsistentIssueData,
  processIssues
} from "./issues/issueProcessingService";
