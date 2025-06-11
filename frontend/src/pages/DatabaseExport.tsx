
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DatabaseExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export completed",
        description: "Database has been successfully exported",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred during export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Export Tool</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Export Database</CardTitle>
            <CardDescription>
              Export your Yulu Suvidha database for backup or migration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? "Exporting..." : "Export Database"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseExport;
