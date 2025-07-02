
export interface IssueType {
  id: string;
  label: string;
  subTypes: IssueSubType[];
}

export interface IssueSubType {
  id: string;
  label: string;
  requiresAccountDetails?: boolean;
}

export const issueTypes: IssueType[] = [
  {
    id: 'technical',
    label: 'Technical Issues',
    subTypes: [
      { id: 'app_bug', label: 'App Bug/Error' },
      { id: 'login_issue', label: 'Login Problems' },
      { id: 'performance', label: 'App Performance' },
      { id: 'feature_request', label: 'Feature Request' }
    ]
  },
  {
    id: 'account',
    label: 'Account Issues',
    subTypes: [
      { id: 'password_reset', label: 'Password Reset' },
      { id: 'profile_update', label: 'Profile Update' },
      { id: 'account_access', label: 'Account Access' },
      { id: 'data_correction', label: 'Data Correction' }
    ]
  },
  {
    id: 'financial',
    label: 'Financial Issues',
    subTypes: [
      { id: 'salary_query', label: 'Salary Query' },
      { id: 'bank_account_change', label: 'Bank Account Change', requiresAccountDetails: true },
      { id: 'payment_issue', label: 'Payment Issue' },
      { id: 'reimbursement', label: 'Reimbursement' }
    ]
  },
  {
    id: 'operational',
    label: 'Operational Issues',
    subTypes: [
      { id: 'schedule_change', label: 'Schedule Change' },
      { id: 'location_issue', label: 'Location Issue' },
      { id: 'equipment_problem', label: 'Equipment Problem' },
      { id: 'safety_concern', label: 'Safety Concern' }
    ]
  },
  {
    id: 'hr',
    label: 'HR Issues',
    subTypes: [
      { id: 'leave_request', label: 'Leave Request' },
      { id: 'grievance', label: 'Grievance' },
      { id: 'policy_query', label: 'Policy Query' },
      { id: 'training_request', label: 'Training Request' }
    ]
  },
  {
    id: 'other',
    label: 'Other',
    subTypes: [
      { id: 'general_inquiry', label: 'General Inquiry' },
      { id: 'feedback', label: 'Feedback' },
      { id: 'suggestion', label: 'Suggestion' }
    ]
  }
];

export const getIssueTypeLabel = (typeId: string): string => {
  const type = issueTypes.find(t => t.id === typeId);
  return type?.label || 'Unknown Type';
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string): string => {
  const type = issueTypes.find(t => t.id === typeId);
  const subType = type?.subTypes.find(st => st.id === subTypeId);
  return subType?.label || 'Unknown Sub Type';
};

export const requiresAccountDetails = (typeId: string, subTypeId: string): boolean => {
  const type = issueTypes.find(t => t.id === typeId);
  const subType = type?.subTypes.find(st => st.id === subTypeId);
  return subType?.requiresAccountDetails || false;
};
