
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Database, FileText, Users, BarChart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DatabaseExport = () => {
  const [exportingData, setExportingData] = useState<string | null>(null);

  const exportOptions = [
    {
      id: 'issues',
      title: 'Issues Data',
      description: 'Export all issues with comments and status history',
      icon: FileText,
      estimatedSize: '2.5 MB'
    },
    {
      id: 'users',
      title: 'Users Data',
      description: 'Export user profiles and role information',
      icon: Users,
      estimatedSize: '500 KB'
    },
    {
      id: 'analytics',
      title: 'Analytics Data',
      description: 'Export analytics and reporting data',
      icon: BarChart,
      estimatedSize: '1.2 MB'
    },
    {
      id: 'complete',
      title: 'Complete Database',
      description: 'Export entire database with all tables',
      icon: Database,
      estimatedSize: '15 MB'
    }
  ];

  const handleExport = async (dataType: string) => {
    setExportingData(dataType);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Export Completed",
        description: `${dataType} data has been successfully exported.`,
      });
      
      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${dataType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportingData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Database Export</h1>
          <p className="text-gray-600">
            Export your data in CSV format for backup, analysis, or migration purposes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exportOptions.map((option) => {
            const IconComponent = option.icon;
            const isExporting = exportingData === option.id;
            
            return (
              <Card key={option.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Est. size: {option.estimatedSize}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <Button
                    onClick={() => handleExport(option.id)}
                    disabled={exportingData !== null}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export {option.title}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Export Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>• All exports are generated in CSV format for easy import into other systems.</p>
              <p>• Sensitive information like passwords are automatically excluded from exports.</p>
              <p>• Large exports may take several minutes to complete.</p>
              <p>• Export files are automatically downloaded to your default download folder.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="px-8"
          >
            Back to Application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExport;
