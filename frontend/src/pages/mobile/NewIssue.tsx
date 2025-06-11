
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload } from 'lucide-react';
import { IssueService } from '@/services/issueService';
import { MasterDataService } from '@/services/masterDataService';
import { IssueType, CreateIssueData } from '@/types';
import { toast } from 'sonner';

export default function NewIssue() {
  const navigate = useNavigate();
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateIssueData>({
    typeId: '',
    subTypeId: '',
    description: '',
    priority: 'medium',
    attachmentUrl: ''
  });

  useEffect(() => {
    loadIssueTypes();
  }, []);

  const loadIssueTypes = async () => {
    try {
      setLoading(true);
      const types = await MasterDataService.getIssueTypes();
      setIssueTypes(types);
    } catch (error) {
      console.error('Error loading issue types:', error);
      toast.error('Failed to load issue types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.typeId || !formData.subTypeId || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const issue = await IssueService.createIssue(formData);
      toast.success('Issue created successfully');
      navigate(`/mobile/issues/${issue.id}`);
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = issueTypes.find(type => type.id === formData.typeId);
  const subTypes = selectedType?.subTypes || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to a storage service
    // For now, we'll just create a placeholder URL
    const placeholderUrl = `https://example.com/uploads/${file.name}`;
    setFormData({ ...formData, attachmentUrl: placeholderUrl });
    toast.success('File attached successfully');
  };

  return (
    <MobileLayout title="New Issue" bgColor="bg-green-600">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Issue Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Issue Type *</Label>
              <Select 
                value={formData.typeId} 
                onValueChange={(value) => setFormData({ ...formData, typeId: value, subTypeId: '' })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Type */}
            <div className="space-y-2">
              <Label htmlFor="subType">Sub Type *</Label>
              <Select 
                value={formData.subTypeId} 
                onValueChange={(value) => setFormData({ ...formData, subTypeId: value })}
                disabled={!formData.typeId || subTypes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub type" />
                </SelectTrigger>
                <SelectContent>
                  {subTypes.map((subType) => (
                    <SelectItem key={subType.id} value={subType.id}>
                      {subType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px]"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Attachment (Optional)</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <label htmlFor="file-upload-gallery" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                    <input
                      id="file-upload-gallery"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
              {formData.attachmentUrl && (
                <p className="text-sm text-green-600">✓ File attached</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Issue...
              </>
            ) : (
              'Create Issue'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/mobile/issues')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </MobileLayout>
  );
}
