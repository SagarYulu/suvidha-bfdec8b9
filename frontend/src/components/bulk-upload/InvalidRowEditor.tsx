
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Save, X } from 'lucide-react';

interface InvalidRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
}

interface InvalidRowEditorProps {
  invalidRows: InvalidRow[];
  onRowUpdate: (rowNumber: number, updatedData: Record<string, string>) => void;
  onRowRemove: (rowNumber: number) => void;
}

const InvalidRowEditor: React.FC<InvalidRowEditorProps> = ({
  invalidRows,
  onRowUpdate,
  onRowRemove
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});

  const startEditing = (row: InvalidRow) => {
    setEditingRow(row.rowNumber);
    setEditData(row.data);
  };

  const saveEdit = () => {
    if (editingRow !== null) {
      onRowUpdate(editingRow, editData);
      setEditingRow(null);
      setEditData({});
    }
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  if (invalidRows.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Invalid Rows ({invalidRows.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invalidRows.map((row) => (
            <div key={row.rowNumber} className="border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Row {row.rowNumber}</span>
                <div className="flex gap-2">
                  {editingRow === row.rowNumber ? (
                    <>
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEditing(row)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onRowRemove(row.rowNumber)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-red-600 space-y-1">
                  {row.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(editingRow === row.rowNumber ? editData : row.data).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-xs">{key}</Label>
                    {editingRow === row.rowNumber ? (
                      <Input
                        value={value}
                        onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 border rounded text-sm">
                        {value || '(empty)'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvalidRowEditor;
