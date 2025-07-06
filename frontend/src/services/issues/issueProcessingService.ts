
import { Issue } from "@/types";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "./issueTypeHelpers";

export const processIssues = (issues: Issue[]): Issue[] => {
  return issues.map(issue => ({
    ...issue,
    // Add any processing logic here
    typeLabel: getIssueTypeLabel(issue.typeId),
    subTypeLabel: getIssueSubTypeLabel(issue.typeId, issue.subTypeId)
  }));
};

export const formatConsistentIssueData = (issues: Issue[]): Issue[] => {
  return issues.map(issue => {
    return {
      ...issue,
      // Ensure consistent data formatting
      createdAt: new Date(issue.createdAt).toISOString(),
      updatedAt: new Date(issue.updatedAt).toISOString(),
      // Add derived fields
      typeLabel: getIssueTypeLabel(issue.typeId),
      subTypeLabel: getIssueSubTypeLabel(issue.typeId, issue.subTypeId)
    };
  });
};
