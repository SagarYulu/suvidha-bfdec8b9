
import { ISSUE_TYPES } from "@/config/issueTypes";

export const getIssueTypeLabel = (typeId: string, includeHindi: boolean = true): string => {
  const type = ISSUE_TYPES.find(t => t.id === typeId);
  if (!type) return typeId;
  
  // For admin dashboard, only show English
  return type.label;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string): string => {
  const type = ISSUE_TYPES.find(t => t.id === typeId);
  if (!type) return subTypeId;
  
  const subType = type.subTypes.find(st => st.id === subTypeId);
  return subType ? subType.label : subTypeId;
};

export const getAllIssueTypes = () => ISSUE_TYPES;

export const getSubTypesForType = (typeId: string) => {
  const type = ISSUE_TYPES.find(t => t.id === typeId);
  return type ? type.subTypes : [];
};
