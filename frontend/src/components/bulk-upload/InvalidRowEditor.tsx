
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface InvalidRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: string[];
}

interface InvalidRowEditorProps {
  invalidRows: InvalidRow[];
  onRowEdit: (rowIndex: number, field: string, value: string) => void;
  validRoles?: string[];
  validCities?: string[];
  validClusters?: Record<string, string[]>;
}

const InvalidRowEditor: React.FC<InvalidRowEditorProps> = ({
  invalidRows,
  onRowEdit,
  validRoles = ['DE', 'FM', 'AM', 'City Head'],
  validCities = ['Bangalore', 'Delhi', 'Mumbai', 'Pune'],
  validClusters = {}
}) => {
  const getAvailableClusters = (city: string) => {
    return validClusters[city] || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">
          {invalidRows.length} row(s) need correction
        </span>
      </div>

      {invalidRows.map((row) => (
        <Card key={row.rowIndex} className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Row {row.rowIndex + 1}</span>
              <div className="flex flex-wrap gap-1">
                {row.errors.map((error, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {error}
                  </Badge>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* User ID */}
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input
                  value={row.data.userId || ''}
                  onChange={(e) => onRowEdit(row.rowIndex, 'userId', e.target.value)}
                  placeholder="YUL001"
                  className={row.errors.some(e => e.includes('userId')) ? 'border-red-300' : ''}
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={row.data.name || ''}
                  onChange={(e) => onRowEdit(row.rowIndex, 'name', e.target.value)}
                  placeholder="Full Name"
                  className={row.errors.some(e => e.includes('name')) ? 'border-red-300' : ''}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={row.data.email || ''}
                  onChange={(e) => onRowEdit(row.rowIndex, 'email', e.target.value)}
                  placeholder="user@yulu.bike"
                  className={row.errors.some(e => e.includes('email')) ? 'border-red-300' : ''}
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="text-sm font-medium">Employee ID (Optional)</label>
                <Input
                  value={row.data.employee_id || ''}
                  onChange={(e) => onRowEdit(row.rowIndex, 'employee_id', e.target.value)}
                  placeholder="EMP001"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium">Phone (Optional)</label>
                <Input
                  value={row.data.phone || ''}
                  onChange={(e) => onRowEdit(row.rowIndex, 'phone', e.target.value)}
                  placeholder="+919876543210"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-medium">City</label>
                <Select
                  value={row.data.city || ''}
                  onValueChange={(value) => {
                    onRowEdit(row.rowIndex, 'city', value);
                    onRowEdit(row.rowIndex, 'cluster', ''); // Reset cluster when city changes
                  }}
                >
                  <SelectTrigger className={row.errors.some(e => e.includes('city')) ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {validCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cluster */}
              <div>
                <label className="text-sm font-medium">Cluster</label>
                <Select
                  value={row.data.cluster || ''}
                  onValueChange={(value) => onRowEdit(row.rowIndex, 'cluster', value)}
                  disabled={!row.data.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={row.data.city ? "Select cluster" : "Select city first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableClusters(row.data.city).map(cluster => (
                      <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={row.data.role || ''}
                  onValueChange={(value) => onRowEdit(row.rowIndex, 'role', value)}
                >
                  <SelectTrigger className={row.errors.some(e => e.includes('role')) ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {validRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvalidRowEditor;
