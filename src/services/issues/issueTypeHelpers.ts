
import { ISSUE_TYPES } from "@/config/issueTypes";

export const getIssueTypeLabel = (typeId: string, showHindi: boolean = false): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  if (!issueType) return typeId;
  return showHindi && issueType.labelHindi ? `${issueType.label} / ${issueType.labelHindi}` : issueType.label;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string, showHindi: boolean = false): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  const subType = issueType?.subTypes.find(subType => subType.id === subTypeId);
  if (!subType) return subTypeId;
  return showHindi && subType.labelHindi ? `${subType.label} / ${subType.labelHindi}` : subType.label;
};
