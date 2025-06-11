
import { ISSUE_TYPES } from '@/config/issueTypes';

export const getIssueTypeLabel = (typeId: string, includeBilingual: boolean = true): string => {
  const type = ISSUE_TYPES.find(t => t.id === typeId);
  return type ? type.label : typeId;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string): string => {
  const type = ISSUE_TYPES.find(t => t.id === typeId);
  if (!type) return subTypeId;
  
  const subType = type.subTypes.find(st => st.id === subTypeId);
  return subType ? subType.label : subTypeId;
};

export const getAllIssueTypes = () => {
  return ISSUE_TYPES;
};

export const getSubTypesForType = (typeId: string) => {
  const type = ISSUE_TYPES.find(t => t.id === typeId);
  return type ? type.subTypes : [];
};
