
// This file is now a facade that re-exports from the modularized services
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
  getAssignedIssuesByUserId
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
  getAnalytics 
} from "./issues/issueAnalyticsService";

export {
  getEmployeeNameByUuid,
  mapEmployeeUuidsToNames,
  getManagersList
} from "./issues/issueUtils";
