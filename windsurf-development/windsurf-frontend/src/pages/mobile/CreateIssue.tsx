
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateIssue } from '@/hooks/useIssues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const MobileCreateIssue: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createIssueMutation = useCreateIssue();
  
  const [formData, setFormData] = useState({
    description: '',
    priority: 'low',
    typeId: 'general',
    subTypeId: 'complaint'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createIssueMutation.mutateAsync({
        ...formData,
        employeeUuid: user?.id,
        status: 'open'
      });
      
      navigate('/mobile/issues');
      toast.success('Issue created successfully');
    } catch (error) {
      toast.error('Failed to create issue');
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full p-3 border rounded-md min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your issue..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                className="w-full p-3 border rounded-md"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/mobile/issues')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createIssueMutation.isPending}
                className="flex-1"
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

export default MobileCreateIssue;
