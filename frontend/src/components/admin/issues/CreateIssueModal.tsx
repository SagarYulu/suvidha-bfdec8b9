
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IssueService } from '@/services/issueService';
import { toast } from 'sonner';

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_type: '',
    issue_subtype: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    employee_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.issue_type || !formData.issue_subtype || !formData.employee_id) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await IssueService.createIssue({
        title: formData.title,
        description: formData.description,
        issue_type: formData.issue_type,
        issue_subtype: formData.issue_subtype,
        priority: formData.priority,
        employee_id: formData.employee_id
      });
      
      toast.success('Issue created successfully');
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        issue_type: '',
        issue_subtype: '',
        priority: 'medium',
        employee_id: ''
      });
    } catch (error) {
      console.error('Failed to create issue:', error);
      toast.error('Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Issue title"
            />
          </div>

          <div>
            <Label htmlFor="employee_id">Employee ID *</Label>
            <Input
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
              placeholder="Employee UUID"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_type">Issue Type *</Label>
              <Select
                value={formData.issue_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, issue_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="tech">Technical</SelectItem>
                  <SelectItem value="ops">Operations</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issue_subtype">Issue Subtype *</Label>
              <Select
                value={formData.issue_subtype}
                onValueChange={(value) => setFormData(prev => ({ ...prev, issue_subtype: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subtype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="system">System Issue</SelectItem>
                  <SelectItem value="access">Access Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue in detail..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIssueModal;
