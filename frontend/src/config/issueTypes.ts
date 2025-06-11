
export const ISSUE_TYPES = [
  {
    id: 'salary',
    label: 'Salary Related',
    subTypes: [
      { id: 'salary_delay', label: 'Salary Delay' },
      { id: 'salary_deduction', label: 'Salary Deduction' },
      { id: 'salary_calculation', label: 'Salary Calculation Error' },
      { id: 'bonus_related', label: 'Bonus Related' },
    ]
  },
  {
    id: 'leave',
    label: 'Leave Management',
    subTypes: [
      { id: 'leave_approval', label: 'Leave Approval' },
      { id: 'leave_balance', label: 'Leave Balance' },
      { id: 'sick_leave', label: 'Sick Leave' },
      { id: 'annual_leave', label: 'Annual Leave' },
    ]
  },
  {
    id: 'performance',
    label: 'Performance Related',
    subTypes: [
      { id: 'appraisal', label: 'Performance Appraisal' },
      { id: 'promotion', label: 'Promotion Related' },
      { id: 'training', label: 'Training Requirements' },
      { id: 'goal_setting', label: 'Goal Setting' },
    ]
  },
  {
    id: 'technical',
    label: 'Technical Issues',
    subTypes: [
      { id: 'system_access', label: 'System Access' },
      { id: 'software_issue', label: 'Software Issue' },
      { id: 'hardware_issue', label: 'Hardware Issue' },
      { id: 'network_issue', label: 'Network Issue' },
    ]
  },
  {
    id: 'administrative',
    label: 'Administrative',
    subTypes: [
      { id: 'policy_query', label: 'Policy Query' },
      { id: 'documentation', label: 'Documentation' },
      { id: 'compliance', label: 'Compliance Related' },
      { id: 'other', label: 'Other Administrative' },
    ]
  }
];

export const getIssueTypeById = (id: string) => {
  return ISSUE_TYPES.find(type => type.id === id);
};

export const getSubTypeById = (typeId: string, subTypeId: string) => {
  const type = getIssueTypeById(typeId);
  return type?.subTypes.find(subType => subType.id === subTypeId);
};
