
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Database, FileText, AlertCircle, CheckCircle, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { DataMigrationGenerator } from '@/utils/dataMigrationGenerator';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DataMigrationTool = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const migrationGenerator = new DataMigrationGenerator();

  const handleGenerateMigration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setMigrationComplete(false);
    
    try {
      toast({
        title: "Starting Enhanced Data Migration",
        description: "Extracting data with improved MySQL compatibility and error handling...",
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 92));
      }, 400);

      await migrationGenerator.generateCompleteMigration();
      
      clearInterval(progressInterval);
      setProgress(100);
      setMigrationComplete(true);
      
      toast({
        title: "Enhanced Migration Script Generated!",
        description: "Improved MySQL migration script with better compatibility has been downloaded.",
      });

    } catch (error) {
      console.error('Migration generation failed:', error);
      toast({
        title: "Migration Failed",
        description: "There was an error generating the migration script. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await migrationGenerator.generateTableReport();
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Database report has been downloaded.",
      });
    } catch (error) {
      console.error('Report generation failed:', error);
      toast({
        title: "Report Failed",
        description: "Failed to generate database report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Enhanced Data Migration Tool
          </CardTitle>
          <CardDescription>
            Extract all data from your Supabase database and generate MySQL-compatible INSERT statements with improved error handling and compatibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Migration Process */}
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              <strong>Enhanced Migration Process:</strong> This updated tool provides better MySQL compatibility, improved error handling, smaller batch sizes, and enhanced data type conversion for a more reliable migration.
            </AlertDescription>
          </Alert>

          {/* Pre-Migration Cleanup Notice */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Before Running New Migration:</strong> If you previously ran a migration script, please clean your MySQL database first to avoid data conflicts. Run the cleanup SQL commands in MySQL Workbench before proceeding.
            </AlertDescription>
          </Alert>

          {/* Generate Migration Button */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleGenerateMigration} 
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Database className="h-4 w-4 mr-2 animate-spin" />
                  Generating Enhanced MySQL Migration Script...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Enhanced MySQL Migration
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  Processing tables with enhanced compatibility... ({progress}%)
                </div>
              </div>
            )}
          </div>

          {/* Additional Tools */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Additional Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleGenerateReport} className="h-auto p-4">
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Generate Table Report</div>
                  <div className="text-xs text-gray-500">View current row counts per table</div>
                </div>
              </Button>
              
              <Button variant="outline" onClick={() => window.open('/export', '_blank')} className="h-auto p-4">
                <div className="text-center">
                  <Database className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Legacy Export Tool</div>
                  <div className="text-xs text-gray-500">Original export functionality</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Success State */}
          {migrationComplete && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Enhanced Migration Script Generated!</h3>
                <Badge variant="secondary">MySQL Optimized</Badge>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-green-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>1. The enhanced MySQL migration script has been downloaded to your computer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>2. If you ran a previous migration, clean your MySQL database first</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>3. Open your MySQL database management tool (phpMyAdmin, MySQL Workbench, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>4. Run the downloaded SQL script to import all your data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>5. Verify the data import was successful and check for any error messages</span>
                  </li>
                </ol>
              </div>

              {/* Technical Improvements */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Enhanced Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Improved MySQL data type conversion and compatibility</li>
                  <li>✅ Enhanced character encoding handling (UTF-8)</li>
                  <li>✅ Smaller batch sizes for better performance</li>
                  <li>✅ Better error handling and reporting</li>
                  <li>✅ Robust escape handling for special characters</li>
                  <li>✅ MySQL-specific configuration settings</li>
                  <li>✅ Detailed error logging in the SQL script</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigrationTool;
