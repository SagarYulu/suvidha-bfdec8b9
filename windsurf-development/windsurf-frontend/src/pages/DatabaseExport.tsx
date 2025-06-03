
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const DatabaseExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // This would call the backend export endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/export/database`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `database_export_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export successful",
          description: "Database has been exported successfully",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Database Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              Export the complete database including all tables, data, and schema information.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• This will export all data including sensitive information</li>
                <li>• The export includes user data, tickets, comments, and analytics</li>
                <li>• Please handle the exported file securely</li>
                <li>• The export file will be in SQL format</li>
              </ul>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Database"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseExport;
