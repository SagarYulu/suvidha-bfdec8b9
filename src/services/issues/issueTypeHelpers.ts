
import { ISSUE_TYPES } from "@/config/issueTypes";

export const getIssueTypeLabel = (typeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  if (!issueType) return typeId;
  return issueType.labelHindi ? `${issueType.label} / ${issueType.labelHindi}` : issueType.label;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  const subType = issueType?.subTypes.find(subType => subType.id === subTypeId);
  if (!subType) return subTypeId;
  return subType.labelHindi ? `${subType.label} / ${subType.labelHindi}` : subType.label;
};
