
// This file is now a facade that re-exports from the modularized services
// This maintains backwards compatibility while allowing a cleaner structure

// Re-export types
import { IssueFilters } from "./issues/issueFilters";
export type { IssueFilters };

// Re-export all the functions from the modular services
export { 
  getIssues,
  getIssueById,
  getIssuesByUserId,
  createIssue,
  updateIssueStatus
} from "./issues/issueCore";

export { 
  getIssueTypeLabel, 
  getIssueSubTypeLabel 
} from "./issues/issueTypeHelpers";

export { 
  addComment 
} from "./issues/issueCommentService";

export { 
  getAnalytics 
} from "./issues/issueAnalyticsService";
