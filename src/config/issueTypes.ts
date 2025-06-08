
export interface IssueSubType {
  id: string;
  label: string;
  labelHindi?: string;
}

export interface IssueType {
  id: string;
  label: string;
  labelHindi?: string;
  subTypes: IssueSubType[];
}

export const ISSUE_TYPES: IssueType[] = [
  {
    id: 'salary',
    label: 'Salary',
    labelHindi: 'वेतन',
    subTypes: [
      { id: 'salary_delay', label: 'Salary Delay', labelHindi: 'वेतन में देरी' },
      { id: 'salary_deduction', label: 'Salary Deduction', labelHindi: 'वेतन कटौती' },
      { id: 'overtime_payment', label: 'Overtime Payment', labelHindi: 'ओवरटाइम भुगतान' }
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    labelHindi: 'उपस्थिति',
    subTypes: [
      { id: 'attendance_marking', label: 'Attendance Marking Issue', labelHindi: 'उपस्थिति अंकन समस्या' },
      { id: 'leave_approval', label: 'Leave Approval', labelHindi: 'छुट्टी की मंजूरी' },
      { id: 'shift_change', label: 'Shift Change Request', labelHindi: 'शिफ्ट परिवर्तन अनुरोध' }
    ]
  },
  {
    id: 'esi',
    label: 'ESI',
    labelHindi: 'ईएसआई',
    subTypes: [
      { id: 'esi_registration', label: 'ESI Registration', labelHindi: 'ईएसआई पंजीकरण' },
      { id: 'esi_card_issue', label: 'ESI Card Issue', labelHindi: 'ईएसआई कार्ड समस्या' },
      { id: 'esi_claim', label: 'ESI Claim', labelHindi: 'ईएसआई दावा' }
    ]
  },
  {
    id: 'pf',
    label: 'PF',
    labelHindi: 'पीएफ',
    subTypes: [
      { id: 'pf_withdrawal', label: 'PF Withdrawal', labelHindi: 'पीएफ निकासी' },
      { id: 'pf_transfer', label: 'PF Transfer', labelHindi: 'पीएफ स्थानांतरण' },
      { id: 'pf_account_issue', label: 'PF Account Issue', labelHindi: 'पीएफ खाता समस्या' }
    ]
  },
  {
    id: 'vehicle',
    label: 'Vehicle',
    labelHindi: 'वाहन',
    subTypes: [
      { id: 'vehicle_maintenance', label: 'Vehicle Maintenance', labelHindi: 'वाहन रखरखाव' },
      { id: 'vehicle_replacement', label: 'Vehicle Replacement', labelHindi: 'वाहन प्रतिस्थापन' },
      { id: 'vehicle_insurance', label: 'Vehicle Insurance', labelHindi: 'वाहन बीमा' }
    ]
  },
  {
    id: 'others',
    label: 'Others',
    labelHindi: 'अन्य',
    subTypes: [
      { id: 'uniform_issue', label: 'Uniform Issue', labelHindi: 'यूनिफॉर्म समस्या' },
      { id: 'training_related', label: 'Training Related', labelHindi: 'प्रशिक्षण संबंधी' },
      { id: 'general_query', label: 'General Query', labelHindi: 'सामान्य प्रश्न' }
    ]
  }
];
