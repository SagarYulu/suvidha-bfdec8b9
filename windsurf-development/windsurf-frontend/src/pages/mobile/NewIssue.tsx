
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send,
  Paperclip,
  Image
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileNewIssue: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit issue logic here
    console.log('Submitting issue:', formData);
    navigate('/mobile/issues');
  };

  const categories = [
    'Technical Issue',
    'HR Query', 
    'Payroll',
    'Leave Request',
    'Equipment',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium block mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium block mb-1">Category</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium block mb-1">Priority</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded-md h-32 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about your issue..."
                required
              />
            </div>

            {/* Attachments */}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-1" />
                Attach File
              </Button>
              <Button type="button" variant="outline" size="sm">
                <Image className="h-4 w-4 mr-1" />
                Add Photo
              </Button>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit Issue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileNewIssue;
