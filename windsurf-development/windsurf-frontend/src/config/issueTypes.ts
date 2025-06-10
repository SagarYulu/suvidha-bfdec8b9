
export const ISSUE_TYPES = [
  {
    id: "personal",
    label: "Personal",
    labelHindi: "व्यक्तिगत",
    subTypes: [
      {
        id: "bank-account",
        label: "Bank Account Change",
        labelHindi: "बैंक खाता परिवर्तन"
      },
      {
        id: "address-change",
        label: "Address Change",
        labelHindi: "पता परिवर्तन"
      },
      {
        id: "contact-update",
        label: "Contact Update",
        labelHindi: "संपर्क अपडेट"
      }
    ]
  },
  {
    id: "technical",
    label: "Technical",
    labelHindi: "तकनीकी",
    subTypes: [
      {
        id: "app-issue",
        label: "App Issue",
        labelHindi: "ऐप समस्या"
      },
      {
        id: "device-problem",
        label: "Device Problem",
        labelHindi: "डिवाइस समस्या"
      },
      {
        id: "connectivity",
        label: "Connectivity Issue",
        labelHindi: "कनेक्टिविटी समस्या"
      }
    ]
  },
  {
    id: "operational",
    label: "Operational",
    labelHindi: "परिचालन",
    subTypes: [
      {
        id: "vehicle-issue",
        label: "Vehicle Issue",
        labelHindi: "वाहन समस्या"
      },
      {
        id: "payment-issue",
        label: "Payment Issue",
        labelHindi: "भुगतान समस्या"
      },
      {
        id: "schedule-change",
        label: "Schedule Change",
        labelHindi: "शेड्यूल परिवर्तन"
      }
    ]
  },
  {
    id: "general",
    label: "General",
    labelHindi: "सामान्य",
    subTypes: [
      {
        id: "inquiry",
        label: "General Inquiry",
        labelHindi: "सामान्य पूछताछ"
      },
      {
        id: "complaint",
        label: "Complaint",
        labelHindi: "शिकायत"
      },
      {
        id: "other",
        label: "Other",
        labelHindi: "अन्य"
      }
    ]
  }
];
