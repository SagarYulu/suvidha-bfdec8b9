
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Database, FileText, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
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
        title: "Starting Data Migration",
        description: "Extracting data from Supabase and generating MySQL INSERT statements...",
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      await migrationGenerator.generateCompleteMigration();
      
      clearInterval(progressInterval);
      setProgress(100);
      setMigrationComplete(true);
      
      toast({
        title: "Migration Script Generated!",
        description: "MySQL migration script has been downloaded to your computer.",
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
            Data Migration Tool
          </CardTitle>
          <CardDescription>
            Extract all data from your Supabase database and generate MySQL-compatible INSERT statements for seamless migration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Migration Process */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Migration Process:</strong> This tool will extract data from all 17 tables in your Supabase database and generate a complete MySQL migration script with proper data formatting and type conversion.
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
                  Generating MySQL Migration Script...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Complete MySQL Migration
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  Extracting and converting data... ({progress}%)
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
                  <div className="text-xs text-gray-500">View row counts per table</div>
                </div>
              </Button>
              
              <Button variant="outline" onClick={() => window.open('/database-export', '_blank')} className="h-auto p-4">
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
                <h3 className="text-lg font-semibold">Migration Script Generated!</h3>
                <Badge variant="secondary">Ready for MySQL</Badge>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-green-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>1. The MySQL migration script has been downloaded to your computer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>2. Open your MySQL database management tool (phpMyAdmin, MySQL Workbench, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>3. Make sure your database schema is already created</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>4. Run the downloaded SQL script to import all your data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>5. Verify the data import was successful</span>
                  </li>
                </ol>
              </div>

              {/* Technical Details */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What's Included:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Data from all 17 database tables</li>
                  <li>✅ Proper MySQL data type conversion</li>
                  <li>✅ Escaped special characters and SQL injection protection</li>
                  <li>✅ Transaction wrapping for data integrity</li>
                  <li>✅ Foreign key handling</li>
                  <li>✅ Batch processing for large datasets</li>
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
