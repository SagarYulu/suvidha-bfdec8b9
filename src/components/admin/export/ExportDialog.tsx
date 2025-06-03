
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, BarChart3, MessageSquare, Database } from 'lucide-react';
import { ExportService, ExportFilters } from '@/services/exportService';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  trigger?: React.ReactNode;
  filters?: ExportFilters;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ 
  trigger, 
  filters = {} 
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (type: string, exportFn: () => Promise<any>) => {
    setIsExporting(type);
    
    try {
      const result = await exportFn();
      toast({
        title: "Export Successful",
        description: `Downloaded ${result.count} records successfully.`,
      });
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'issues',
      title: 'Export Issues',
      description: 'Download all issues with details and comments',
      icon: FileText,
      action: () => ExportService.exportIssues(filters)
    },
    {
      id: 'analytics',
      title: 'Export Analytics',
      description: 'Download analytics summary and metrics',
      icon: BarChart3,
      action: () => ExportService.exportAnalytics(filters)
    },
    {
      id: 'feedback',
      title: 'Export Feedback',
      description: 'Download all feedback and ratings',
      icon: MessageSquare,
      action: () => ExportService.exportFeedback(filters)
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Export',
      description: 'Download all data in one comprehensive file',
      icon: Database,
      action: () => ExportService.exportComprehensive()
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isLoading = isExporting === option.id;
            
            return (
              <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5" />
                    {option.title}
                  </CardTitle>
                  <CardDescription>
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleExport(option.id, option.action)}
                    disabled={!!isExporting}
                    className="w-full"
                    variant={isLoading ? "secondary" : "default"}
                  >
                    {isLoading ? (
                      <>
                        <Download className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Export Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Files are downloaded in CSV format for easy analysis</li>
            <li>• Current filters are applied to exported data</li>
            <li>• All timestamps are in your local timezone</li>
            <li>• Comprehensive export includes all available data</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
