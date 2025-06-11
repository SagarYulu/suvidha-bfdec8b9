
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiClient } from '@/services/apiClient';
import { useToast } from '@/hooks/use-toast';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_type: '',
    issue_subtype: '',
    priority: 'medium',
    employee_id: '',
  });

  const { toast } = useToast();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await ApiClient.get('/api/employees');
      return response.data;
    },
    enabled: isOpen,
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: any) => {
      await ApiClient.post('/api/issues', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Issue created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create issue",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIssueMutation.mutate(formData);
  };

  const issueTypes = [
    { value: 'technical', label: 'Technical' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'general', label: 'General' },
  ];

  const issueSubTypes = {
    technical: ['Authentication', 'Application Error', 'Performance', 'Bug Report'],
    hr: ['Payroll', 'Leave', 'Policy', 'Grievance'],
    finance: ['Reimbursement', 'Salary', 'Benefits', 'Tax'],
    operations: ['Schedule', 'Equipment', 'Process', 'Training'],
    general: ['Information', 'Request', 'Complaint', 'Suggestion'],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee: any) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.emp_name} ({employee.emp_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title (Optional)</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief issue title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Issue Type</label>
            <Select
              value={formData.issue_type}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                issue_type: value, 
                issue_subtype: '' 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.issue_type && (
            <div>
              <label className="block text-sm font-medium mb-1">Issue Subtype</label>
              <Select
                value={formData.issue_subtype}
                onValueChange={(value) => setFormData({ ...formData, issue_subtype: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue subtype" />
                </SelectTrigger>
                <SelectContent>
                  {issueSubTypes[formData.issue_type as keyof typeof issueSubTypes]?.map((subtype) => (
                    <SelectItem key={subtype} value={subtype.toLowerCase()}>
                      {subtype}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createIssueMutation.isPending || !formData.description || !formData.employee_id}
            >
              {createIssueMutation.isPending ? 'Creating...' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIssueModal;
