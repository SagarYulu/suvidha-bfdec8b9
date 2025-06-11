
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IssueTypeSelector from './IssueTypeSelector';
import { FileText } from 'lucide-react';

interface StandardIssueFormProps {
  issueTypes: any[];
  onSubmit: (data: StandardIssueData) => void;
  isLoading?: boolean;
}

interface StandardIssueData {
  typeId: string;
  subTypeId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

const StandardIssueForm: React.FC<StandardIssueFormProps> = ({
  issueTypes,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<StandardIssueData>({
    typeId: '',
    subTypeId: '',
    priority: 'medium',
    description: ''
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return formData.typeId && 
           formData.subTypeId && 
           formData.description.trim().length > 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <IssueTypeSelector
            issueTypes={issueTypes}
            selectedType={formData.typeId}
            selectedSubType={formData.subTypeId}
            onTypeChange={(typeId) => setFormData(prev => ({ ...prev, typeId }))}
            onSubTypeChange={(subTypeId) => setFormData(prev => ({ ...prev, subTypeId }))}
          />

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <span className={priority.color}>
                      {priority.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue in detail..."
              className="min-h-[120px]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Creating Issue...' : 'Create Issue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StandardIssueForm;
