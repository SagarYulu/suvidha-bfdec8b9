
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvalidRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
}

interface DashboardUserInvalidRowEditorProps {
  row: InvalidRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rowNumber: number, data: Record<string, string>) => void;
  onSkip: (rowNumber: number) => void;
}

const DashboardUserInvalidRowEditor: React.FC<DashboardUserInvalidRowEditorProps> = ({
  row,
  open,
  onOpenChange,
  onSave,
  onSkip
}) => {
  const [editedData, setEditedData] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (row) {
      setEditedData({ ...row.data });
    }
  }, [row]);

  if (!row) return null;

  const handleSave = () => {
    onSave(row.rowNumber, editedData);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip(row.rowNumber);
    onOpenChange(false);
  };

  const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Pune', 'Chennai', 'Hyderabad'];
  const clusters = ['North', 'South', 'East', 'West', 'Central'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fix Row {row.rowNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Issues:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {row.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={editedData.name || ''}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editedData.email || ''}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={editedData.phone || ''}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>Employee ID</Label>
              <Input
                value={editedData.employeeId || ''}
                onChange={(e) => setEditedData({ ...editedData, employeeId: e.target.value })}
              />
            </div>

            <div>
              <Label>City</Label>
              <Select
                value={editedData.city || ''}
                onValueChange={(value) => setEditedData({ ...editedData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cluster</Label>
              <Select
                value={editedData.cluster || ''}
                onValueChange={(value) => setEditedData({ ...editedData, cluster: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cluster" />
                </SelectTrigger>
                <SelectContent>
                  {clusters.map(cluster => (
                    <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip Row
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardUserInvalidRowEditor;
