
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { parseEmployeeCSV, getCSVTemplate } from "@/utils/csvHelpers";
import { Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BulkUserUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const employees = await parseEmployeeCSV(file);
      
      // Map CSV fields to employees table structure
      // Using correct field names as per the database schema
      const employeesData = employees.map(emp => ({
        name: emp.name,
        email: emp.email,
        phone: emp.phone || null,
        emp_id: emp.emp_id,
        city: emp.city || null,
        role: emp.role || 'employee',
        password: emp.password || 'changeme123',
        date_of_joining: emp.date_of_joining || null
      }));
      
      // Insert employees into Supabase
      const { error, count } = await supabase
        .from('employees')
        .insert(employeesData)
        .select('count');

      if (error) throw error;

      toast({
        title: "Upload Successful",
        description: `Successfully added ${employees.length} employees.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading the employee data. Please check the CSV format.",
      });
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([getCSVTemplate()], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
        
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="default"
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">CSV Format Instructions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Required fields: Employee ID, Name, Email, Role (admin/employee)</li>
          <li>Dates should be in YYYY-MM-DD format</li>
          <li>Phone numbers should not include spaces or special characters</li>
          <li>Default password will be set as 'changeme123'</li>
          <li>Download the template for the correct format</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkUserUpload;
