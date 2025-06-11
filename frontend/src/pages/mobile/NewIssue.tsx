
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IssueService } from '@/services/issueService';
import { ISSUE_TYPES } from '@/config/issueTypes';
import { toast } from 'sonner';

export default function NewIssue() {
  const [typeId, setTypeId] = useState('');
  const [subTypeId, setSubTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const selectedType = ISSUE_TYPES.find(t => t.id === typeId);
  const subTypes = selectedType ? selectedType.subTypes : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeId || !subTypeId || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await IssueService.createIssue({
        typeId,
        subTypeId,
        description: description.trim(),
        priority: priority as any
      });
      
      toast.success('Issue submitted successfully');
      navigate('/mobile/issues');
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to submit issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout 
      title="New Issue"
      showBackButton
      onBackClick={() => navigate('/mobile/issues')}
    >
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="typeId">Issue Type *</Label>
                <Select value={typeId} onValueChange={(value) => {
                  setTypeId(value);
                  setSubTypeId(''); // Reset sub type when type changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subTypeId">Sub Type *</Label>
                <Select 
                  value={subTypeId} 
                  onValueChange={setSubTypeId}
                  disabled={!typeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub type" />
                  </SelectTrigger>
                  <SelectContent>
                    {subTypes.map((subType) => (
                      <SelectItem key={subType.id} value={subType.id}>
                        {subType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Issue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
