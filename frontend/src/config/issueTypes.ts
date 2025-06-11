
export const ISSUE_TYPES = [
  {
    id: "salary_benefits",
    label: "Salary & Benefits",
    subTypes: [
      { id: "salary_delay", label: "Salary Delay" },
      { id: "incorrect_salary", label: "Incorrect Salary" },
      { id: "benefits_query", label: "Benefits Query" },
      { id: "pf_query", label: "PF Query" }
    ]
  },
  {
    id: "leave_attendance",
    label: "Leave & Attendance",
    subTypes: [
      { id: "leave_approval", label: "Leave Approval" },
      { id: "attendance_issue", label: "Attendance Issue" },
      { id: "overtime_query", label: "Overtime Query" }
    ]
  },
  {
    id: "technical_support",
    label: "Technical Support",
    subTypes: [
      { id: "app_issue", label: "App Issue" },
      { id: "login_problem", label: "Login Problem" },
      { id: "device_issue", label: "Device Issue" }
    ]
  },
  {
    id: "policy_compliance",
    label: "Policy & Compliance",
    subTypes: [
      { id: "policy_query", label: "Policy Query" },
      { id: "compliance_issue", label: "Compliance Issue" },
      { id: "document_request", label: "Document Request" }
    ]
  },
  {
    id: "other",
    label: "Other",
    subTypes: [
      { id: "general_query", label: "General Query" },
      { id: "feedback", label: "Feedback" },
      { id: "suggestion", label: "Suggestion" }
    ]
  }
];
