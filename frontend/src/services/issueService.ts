
// Minimal issue service to prevent build errors
export interface IssueFilters {
  city?: string;
  cluster?: string;
  type?: string;
  issueType?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export const getAnalytics = async (filters?: any) => {
  // TODO: Implement with local backend
  return null;
};

export const getIssues = async (filters?: IssueFilters) => {
  // TODO: Implement with local backend
  return { issues: [] };
};

export const getIssueTypeLabel = (typeId: string, showHindi?: boolean) => {
  return typeId;
};

export const getIssueSubTypeLabel = (subTypeId: string, showHindi?: boolean) => {
  return subTypeId;
};
