
import { Issue } from '@/types';

export const mapIssueType = (originalType: string, originalSubType: string) => {
  // Map original issue types to standardized ones
  const typeMapping: Record<string, { type: string; subType: string; priority: Issue['priority'] }> = {
    'IT_SUPPORT': {
      type: 'IT Support',
      subType: 'General IT Issue',
      priority: 'medium'
    },
    'PAYROLL': {
      type: 'Payroll',
      subType: 'Salary Issue',
      priority: 'high'
    },
    'LEAVE': {
      type: 'Leave Management',
      subType: 'Leave Request',
      priority: 'low'
    },
    'BENEFITS': {
      type: 'Benefits',
      subType: 'Benefits Inquiry',
      priority: 'medium'
    },
    'GENERAL': {
      type: 'General',
      subType: 'General Inquiry',
      priority: 'low'
    }
  };

  const mapping = typeMapping[originalType] || typeMapping['GENERAL'];
  
  return {
    mappedTypeId: mapping.type,
    mappedSubTypeId: mapping.subType,
    priority: mapping.priority
  };
};

export const isIssueMappable = (issue: Issue): boolean => {
  // Check if issue needs mapping (e.g., if it's categorized as "others" or has no type)
  return !issue.typeId || issue.typeId === 'others' || issue.typeId === 'UNKNOWN';
};

export const mapIssuePriority = (typeId: string, subTypeId: string): Issue['priority'] => {
  // Emergency cases
  if (typeId === 'IT_SUPPORT' && subTypeId === 'SYSTEM_DOWN') {
    return 'urgent';
  }
  
  if (typeId === 'PAYROLL' && subTypeId === 'SALARY_NOT_CREDITED') {
    return 'urgent';
  }

  // High priority cases
  if (typeId === 'LEAVE' && subTypeId === 'URGENT_LEAVE') {
    return 'high';
  }
  
  if (typeId === 'IT_SUPPORT' && (subTypeId === 'EMAIL_ISSUE' || subTypeId === 'VPN_ISSUE')) {
    return 'high';
  }

  // Medium priority cases
  if (typeId === 'PAYROLL' || typeId === 'BENEFITS') {
    return 'medium';
  }

  // Default to low priority
  return 'low';
};
