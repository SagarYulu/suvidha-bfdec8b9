
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FileText, Users, Settings, AlertTriangle, HelpCircle } from 'lucide-react';

interface IssueType {
  id: string;
  name: string;
  nameHindi?: string;
  icon: React.ComponentType<any>;
  color: string;
  subtypes: IssueSubtype[];
}

interface IssueSubtype {
  id: string;
  name: string;
  nameHindi?: string;
  description?: string;
}

interface IssueTypeSelectorProps {
  selectedTypeId?: string;
  selectedSubtypeId?: string;
  onTypeSelect: (typeId: string) => void;
  onSubtypeSelect: (subtypeId: string) => void;
  language: 'en' | 'hi';
}

const IssueTypeSelector: React.FC<IssueTypeSelectorProps> = ({
  selectedTypeId,
  selectedSubtypeId,
  onTypeSelect,
  onSubtypeSelect,
  language
}) => {
  const [issueTypes] = useState<IssueType[]>([
    {
      id: 'payroll',
      name: 'Payroll & Compensation',
      nameHindi: 'वेतन और मुआवजा',
      icon: FileText,
      color: 'bg-blue-500',
      subtypes: [
        { id: 'salary_delay', name: 'Salary Delay', nameHindi: 'वेतन में देरी' },
        { id: 'salary_deduction', name: 'Salary Deduction', nameHindi: 'वेतन कटौती' },
        { id: 'overtime_payment', name: 'Overtime Payment', nameHindi: 'ओवरटाइम भुगतान' },
        { id: 'bonus_issue', name: 'Bonus Issue', nameHindi: 'बोनस समस्या' },
        { id: 'payslip_issue', name: 'Payslip Issue', nameHindi: 'पेस्लिप समस्या' }
      ]
    },
    {
      id: 'hr',
      name: 'HR & Administrative',
      nameHindi: 'एचआर और प्रशासनिक',
      icon: Users,
      color: 'bg-green-500',
      subtypes: [
        { id: 'leave_approval', name: 'Leave Approval', nameHindi: 'छुट्टी की मंजूरी' },
        { id: 'document_verification', name: 'Document Verification', nameHindi: 'दस्तावेज़ सत्यापन' },
        { id: 'policy_clarification', name: 'Policy Clarification', nameHindi: 'नीति स्पष्टीकरण' },
        { id: 'attendance_issue', name: 'Attendance Issue', nameHindi: 'उपस्थिति समस्या' },
        { id: 'grievance', name: 'General Grievance', nameHindi: 'सामान्य शिकायत' }
      ]
    },
    {
      id: 'technical',
      name: 'Technical Support',
      nameHindi: 'तकनीकी सहायता',
      icon: Settings,
      color: 'bg-purple-500',
      subtypes: [
        { id: 'app_issue', name: 'App Related Issue', nameHindi: 'ऐप संबंधी समस्या' },
        { id: 'vehicle_issue', name: 'Vehicle Issue', nameHindi: 'वाहन की समस्या' },
        { id: 'equipment_problem', name: 'Equipment Problem', nameHindi: 'उपकरण की समस्या' },
        { id: 'system_access', name: 'System Access', nameHindi: 'सिस्टम एक्सेस' },
        { id: 'training_request', name: 'Training Request', nameHindi: 'प्रशिक्षण अनुरोध' }
      ]
    },
    {
      id: 'safety',
      name: 'Safety & Security',
      nameHindi: 'सुरक्षा और संरक्षा',
      icon: AlertTriangle,
      color: 'bg-red-500',
      subtypes: [
        { id: 'workplace_safety', name: 'Workplace Safety', nameHindi: 'कार्यक्षेत्र सुरक्षा' },
        { id: 'incident_report', name: 'Incident Report', nameHindi: 'घटना रिपोर्ट' },
        { id: 'harassment', name: 'Harassment', nameHindi: 'उत्पीड़न' },
        { id: 'theft_loss', name: 'Theft/Loss', nameHindi: 'चोरी/नुकसान' },
        { id: 'security_concern', name: 'Security Concern', nameHindi: 'सुरक्षा चिंता' }
      ]
    },
    {
      id: 'other',
      name: 'Other',
      nameHindi: 'अन्य',
      icon: HelpCircle,
      color: 'bg-gray-500',
      subtypes: [
        { id: 'suggestion', name: 'Suggestion', nameHindi: 'सुझाव' },
        { id: 'feedback', name: 'Feedback', nameHindi: 'प्रतिक्रिया' },
        { id: 'general_query', name: 'General Query', nameHindi: 'सामान्य प्रश्न' },
        { id: 'other_issue', name: 'Other Issue', nameHindi: 'अन्य समस्या' }
      ]
    }
  ]);

  const selectedType = issueTypes.find(type => type.id === selectedTypeId);

  return (
    <div className="space-y-4">
      {/* Issue Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          {language === 'hi' ? 'समस्या का प्रकार चुनें' : 'Select Issue Type'}
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {issueTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedTypeId === type.id;
            
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md hover:bg-gray-50'
                }`}
                onClick={() => onTypeSelect(type.id)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${type.color} p-2 rounded-lg text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {language === 'hi' ? type.nameHindi : type.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {type.subtypes.length} {language === 'hi' ? 'उप-प्रकार' : 'subtypes'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Issue Subtype Selection */}
      {selectedType && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {language === 'hi' ? 'विशिष्ट समस्या चुनें' : 'Select Specific Issue'}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {selectedType.subtypes.map((subtype) => {
              const isSelected = selectedSubtypeId === subtype.id;
              
              return (
                <Card 
                  key={subtype.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSubtypeSelect(subtype.id)}
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <h4 className="font-medium">
                        {language === 'hi' ? subtype.nameHindi : subtype.name}
                      </h4>
                      {subtype.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {subtype.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Badge variant="default" className="bg-blue-500">
                        {language === 'hi' ? 'चुना गया' : 'Selected'}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTypeSelector;
