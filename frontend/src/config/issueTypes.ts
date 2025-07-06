
export interface IssueType {
  id: string;
  label: string;
  labelHindi?: string;
  subTypes: IssueSubType[];
  description?: string;
  category: 'operational' | 'technical' | 'administrative' | 'financial';
}

export interface IssueSubType {
  id: string;
  label: string;
  labelHindi?: string;
  description?: string;
  requiresApproval?: boolean;
  escalationRequired?: boolean;
}

export const ISSUE_TYPES: IssueType[] = [
  {
    id: 'salary',
    label: 'Salary',
    labelHindi: 'वेतन',
    category: 'financial',
    subTypes: [
      {
        id: 'salary_delay',
        label: 'Salary Delay',
        labelHindi: 'वेतन में देरी'
      },
      {
        id: 'salary_deduction',
        label: 'Salary Deduction',
        labelHindi: 'वेतन कटौती'
      },
      {
        id: 'incentive_issue',
        label: 'Incentive Issue',
        labelHindi: 'प्रोत्साहन समस्या'
      }
    ]
  },
  {
    id: 'vehicle',
    label: 'Vehicle',
    labelHindi: 'वाहन',
    category: 'operational',
    subTypes: [
      {
        id: 'vehicle_breakdown',
        label: 'Vehicle Breakdown',
        labelHindi: 'वाहन खराब'
      },
      {
        id: 'battery_issue',
        label: 'Battery Issue',
        labelHindi: 'बैटरी समस्या'
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        labelHindi: 'रखरखाव'
      }
    ]
  },
  {
    id: 'app',
    label: 'App Issues',
    labelHindi: 'ऐप समस्या',
    category: 'technical',
    subTypes: [
      {
        id: 'login_issue',
        label: 'Login Issue',
        labelHindi: 'लॉगिन समस्या'
      },
      {
        id: 'booking_issue',
        label: 'Booking Issue',
        labelHindi: 'बुकिंग समस्या'
      },
      {
        id: 'payment_issue',
        label: 'Payment Issue',
        labelHindi: 'भुगतान समस्या'
      }
    ]
  },
  {
    id: 'documentation',
    label: 'Documentation',
    labelHindi: 'दस्तावेज़',
    category: 'administrative',
    subTypes: [
      {
        id: 'license_issue',
        label: 'License Issue',
        labelHindi: 'लाइसेंस समस्या'
      },
      {
        id: 'kyc_issue',
        label: 'KYC Issue',
        labelHindi: 'केवाईसी समस्या'
      },
      {
        id: 'profile_update',
        label: 'Profile Update',
        labelHindi: 'प्रोफाइल अपडेट'
      }
    ]
  },
  {
    id: 'bank_account',
    label: 'Bank Account',
    labelHindi: 'बैंक खाता',
    category: 'financial',
    subTypes: [
      {
        id: 'account_change',
        label: 'Account Change',
        labelHindi: 'खाता परिवर्तन',
        requiresApproval: true
      },
      {
        id: 'payment_failure',
        label: 'Payment Failure',
        labelHindi: 'भुगतान विफलता'
      }
    ]
  },
  {
    id: 'training',
    label: 'Training',
    labelHindi: 'प्रशिक्षण',
    category: 'administrative',
    subTypes: [
      {
        id: 'training_request',
        label: 'Training Request',
        labelHindi: 'प्रशिक्षण अनुरोध'
      },
      {
        id: 'certification',
        label: 'Certification',
        labelHindi: 'प्रमाणीकरण'
      }
    ]
  },
  {
    id: 'other',
    label: 'Other',
    labelHindi: 'अन्य',
    category: 'operational',
    subTypes: [
      {
        id: 'general_query',
        label: 'General Query',
        labelHindi: 'सामान्य प्रश्न'
      },
      {
        id: 'feedback',
        label: 'Feedback',
        labelHindi: 'फीडबैक'
      },
      {
        id: 'complaint',
        label: 'Complaint',
        labelHindi: 'शिकायत',
        escalationRequired: true
      }
    ]
  }
];

export const getIssueTypeById = (id: string): IssueType | undefined => {
  return ISSUE_TYPES.find(type => type.id === id);
};

export const getSubTypeById = (typeId: string, subTypeId: string): IssueSubType | undefined => {
  const type = getIssueTypeById(typeId);
  return type?.subTypes.find(subType => subType.id === subTypeId);
};

export const getAllSubTypes = (): IssueSubType[] => {
  return ISSUE_TYPES.flatMap(type => type.subTypes);
};

export const getIssueTypesByCategory = (category: IssueType['category']): IssueType[] => {
  return ISSUE_TYPES.filter(type => type.category === category);
};
