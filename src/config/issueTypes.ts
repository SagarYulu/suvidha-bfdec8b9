
export interface IssueSubType {
  id: string;
  label: string;
}

export interface IssueType {
  id: string;
  label: string;
  subTypes: IssueSubType[];
}

export const ISSUE_TYPES: IssueType[] = [
  {
    id: "salary",
    label: "Salary Issue",
    subTypes: [
      { id: "salary-not-received", label: "Didn't receive the salary" },
      { id: "less-salary", label: "Received less salary" },
      { id: "lop-incorrect", label: "Marked LOP incorrectly" },
      { id: "no-incentives", label: "Didn't receive incentives" },
      { id: "no-ot", label: "Not received OT" },
      { id: "no-payslip", label: "Didn't receive payslip" },
      { id: "salary-advance", label: "Need salary advance" },
      { id: "increment-not-happened", label: "Increment not happened" },
      { id: "increment-when", label: "When will I get increment" },
    ]
  },
  {
    id: "pf",
    label: "PF",
    subTypes: [
      { id: "bank-kyc", label: "Bank KYC approval" },
      { id: "name-change", label: "Name change approval" },
      { id: "advance-request", label: "Advance request approval" },
      { id: "pf-transfer", label: "PF transfer approval" },
      { id: "nominee-details", label: "Nominee details update" },
    ]
  },
  {
    id: "esi",
    label: "ESI",
    subTypes: [
      { id: "family-addition", label: "Family members addition" },
      { id: "nominee-change", label: "Need to change nominee" },
      { id: "name-change", label: "Need to change name" },
    ]
  },
  {
    id: "leave",
    label: "Leave / Rest Days",
    subTypes: [
      { id: "manager-rejected", label: "Manager rejected leave / rest day" },
      { id: "not-added", label: "Leave / rest day not added" },
    ]
  },
  {
    id: "manager",
    label: "Manager / Cluster executive Issue",
    subTypes: []
  },
  {
    id: "facility",
    label: "Facility issue",
    subTypes: [
      { id: "no-water", label: "Water not available at workshop / YC" },
      { id: "washroom-hygiene", label: "Washrooms hygiene is not maintained" },
    ]
  },
  {
    id: "coworker",
    label: "Co-worker issue",
    subTypes: [
      { id: "abusing", label: "Abusing" },
      { id: "threatening", label: "Threatening" },
      { id: "manhandled", label: "Manhandled" },
    ]
  },
  {
    id: "personal",
    label: "Personal Details change",
    subTypes: [
      { id: "bank-account", label: "Bank Account" },
      { id: "email-id", label: "Email ID" },
      { id: "phone-number", label: "Phone Number" },
    ]
  },
];
