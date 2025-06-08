
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, X, FileText } from 'lucide-react';
import { ISSUE_TYPES } from '@/config/issueTypes';

interface IssueCreationFormProps {
  onSuccess?: () => void;
  className?: string;
}

const IssueCreationForm: React.FC<IssueCreationFormProps> = ({ onSuccess, className = "" }) => {
  const [formData, setFormData] = useState({
    typeId: '',
    subTypeId: '',
    description: '',
    priority: 'medium',
    attachments: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const selectedType = ISSUE_TYPES.find(type => type.id === formData.typeId);
  const subTypes = selectedType?.subTypes || [];

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      typeId: value,
      subTypeId: '' // Reset subtype when type changes
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 5) // Max 5 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.typeId || !formData.subTypeId || !formData.description.trim()) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const issueData = {
        employeeUuid: user.id,
        typeId: formData.typeId,
        subTypeId: formData.subTypeId,
        description: formData.description.trim(),
        priority: formData.priority,
        status: 'open',
        attachments: formData.attachments.map(file => file.name)
      };

      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(issueData)
      });

      const result = await response.json();

      if (result.success) {
        // Upload files if any
        if (formData.attachments.length > 0) {
          const formDataFiles = new FormData();
          formData.attachments.forEach(file => {
            formDataFiles.append('files', file);
          });
          formDataFiles.append('issueId', result.issueId);

          await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formDataFiles
          });
        }

        toast({
          title: "Issue Created Successfully",
          description: "Your issue has been submitted and will be reviewed shortly."
        });

        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/mobile/issues');
        }
      } else {
        throw new Error(result.error || 'Failed to create issue');
      }
    } catch (error) {
      console.error('Issue creation error:', error);
      toast({
        title: "Failed to create issue",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle>Create New Issue</CardTitle>
        <p className="text-sm text-gray-600">
          Describe your issue and we'll help resolve it
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Type *</label>
            <Select value={formData.typeId} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                    {type.labelHindi && (
                      <span className="text-gray-500 ml-2">({type.labelHindi})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Issue Subtype */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Subtype *</label>
            <Select 
              value={formData.subTypeId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, subTypeId: value }))}
              disabled={!formData.typeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue subtype" />
              </SelectTrigger>
              <SelectContent>
                {subTypes.map((subType) => (
                  <SelectItem key={subType.id} value={subType.id}>
                    {subType.label}
                    {subType.labelHindi && (
                      <span className="text-gray-500 ml-2">({subType.labelHindi})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
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
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              placeholder="Please describe your issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Attachments (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center text-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload files (Images, PDF, Word)
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Max 5MB per file, up to 5 files
                </span>
              </label>
            </div>

            {/* Uploaded Files */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating Issue...' : 'Create Issue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IssueCreationForm;
