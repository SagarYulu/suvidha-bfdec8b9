
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateIssue } from '@/hooks/useIssues';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NewIssue: React.FC = () => {
  const navigate = useNavigate();
  const createIssueMutation = useCreateIssue();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    typeId: '',
    subTypeId: '',
  });

  const issueTypes = [
    { id: 'technical', label: 'Technical Issue' },
    { id: 'account', label: 'Account Issue' },
    { id: 'payment', label: 'Payment Issue' },
    { id: 'service', label: 'Service Issue' },
    { id: 'other', label: 'Other' },
  ];

  const subTypes = {
    technical: [
      { id: 'app_crash', label: 'App Crash' },
      { id: 'login_issue', label: 'Login Issue' },
      { id: 'performance', label: 'Performance Issue' },
    ],
    account: [
      { id: 'profile_update', label: 'Profile Update' },
      { id: 'verification', label: 'Account Verification' },
      { id: 'suspension', label: 'Account Suspension' },
    ],
    payment: [
      { id: 'salary', label: 'Salary Issue' },
      { id: 'incentive', label: 'Incentive Issue' },
      { id: 'reimbursement', label: 'Reimbursement' },
    ],
    service: [
      { id: 'vehicle', label: 'Vehicle Issue' },
      { id: 'uniform', label: 'Uniform Issue' },
      { id: 'equipment', label: 'Equipment Issue' },
    ],
    other: [
      { id: 'general', label: 'General Query' },
      { id: 'feedback', label: 'Feedback' },
      { id: 'complaint', label: 'Complaint' },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createIssueMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        type_id: formData.typeId,
        sub_type_id: formData.subTypeId,
      });
      
      navigate('/mobile/issues');
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  const currentSubTypes = formData.typeId ? subTypes[formData.typeId as keyof typeof subTypes] || [] : [];

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Create New Issue</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Issue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeId">Issue Type</Label>
              <Select 
                onValueChange={(value) => setFormData({...formData, typeId: value, subTypeId: ''})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.typeId && (
              <div className="space-y-2">
                <Label htmlFor="subTypeId">Sub Type</Label>
                <Select 
                  onValueChange={(value) => setFormData({...formData, subTypeId: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSubTypes.map((subType) => (
                      <SelectItem key={subType.id} value={subType.id}>
                        {subType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                onValueChange={(value) => setFormData({...formData, priority: value})}
                defaultValue="medium"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description of the issue"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createIssueMutation.isPending}
              >
                {createIssueMutation.isPending ? 'Creating...' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewIssue;
