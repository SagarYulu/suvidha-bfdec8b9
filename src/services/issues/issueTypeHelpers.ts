
import { ISSUE_TYPES } from "@/config/issueTypes";

export const getIssueTypeLabel = (typeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  return issueType?.label || typeId;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  const subType = issueType?.subTypes.find(subType => subType.id === subTypeId);
  return subType?.label || subTypeId;
};
