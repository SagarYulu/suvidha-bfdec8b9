import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Database, FileText, Table, CheckCircle, AlertCircle, Code, Package } from 'lucide-react';
import { DatabaseExporter, type ExportResult } from '@/utils/dataExporter';
import { MySQLSchemaGenerator } from '@/utils/mysqlSchemaGenerator';
import { toast } from '@/hooks/use-toast';

const DatabaseExportTool = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTable, setCurrentTable] = useState('');

  const exporter = new DatabaseExporter();

  const downloadMySQLSchema = () => {
    try {
      MySQLSchemaGenerator.downloadMySQLScript();
      toast({
        title: "MySQL Schema Downloaded",
        description: "MySQL CREATE TABLE script has been downloaded.",
      });
    } catch (error) {
      console.error('MySQL schema download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download MySQL schema.",
        variant: "destructive",
      });
    }
  };

  const downloadCompleteSQLScript = async () => {
    try {
      await exporter.exportAsCompleteSQLScript(exportResults);
      toast({
        title: "Complete SQL Script Downloaded",
        description: "Complete MySQL script with schema and data has been downloaded.",
      });
    } catch (error) {
      console.error('Complete SQL script download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download complete SQL script.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setCurrentTable('');
    
    try {
      toast({
        title: "Starting Export",
        description: "Beginning database export process...",
      });

      // Mock progress updates for better UX
      const tables = [
        'employees', 'issues', 'dashboard_users', 'issue_comments',
        'issue_internal_comments', 'issue_audit_trail', 'issue_notifications',
        'ticket_feedback', 'master_cities', 'master_clusters', 'master_roles',
        'rbac_permissions', 'rbac_roles', 'rbac_role_permissions',
        'rbac_user_roles', 'dashboard_user_audit_logs', 'master_audit_logs'
      ];

      let completed = 0;
      const updateProgress = () => {
        completed++;
        setProgress((completed / tables.length) * 100);
        if (completed < tables.length) {
          setCurrentTable(tables[completed]);
        }
      };

      // Start progress simulation
      const progressInterval = setInterval(updateProgress, 200);

      const results = await exporter.exportAllTables();
      
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentTable('');
      setExportResults(results);
      
      const totalRecords = results.reduce((sum, r) => sum + r.count, 0);
      
      toast({
        title: "Export Complete!",
        description: `Successfully exported ${totalRecords} records from ${results.length} tables.`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the database. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSVFiles = async () => {
    try {
      await exporter.exportAsCSVFiles(exportResults);
      toast({
        title: "CSV Files Downloaded",
        description: "All CSV files have been downloaded to your computer.",
      });
    } catch (error) {
      console.error('CSV download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download CSV files.",
        variant: "destructive",
      });
    }
  };

  const downloadSQLFile = async () => {
    try {
      await exporter.exportAsSQLFile(exportResults);
      toast({
        title: "SQL File Downloaded",
        description: "SQL export file has been downloaded.",
      });
    } catch (error) {
      console.error('SQL download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download SQL file.",
        variant: "destructive",
      });
    }
  };

  const downloadJSONFile = async () => {
    try {
      await exporter.exportAsJSON(exportResults);
      toast({
        title: "JSON File Downloaded",
        description: "JSON export file has been downloaded.",
      });
    } catch (error) {
      console.error('JSON download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download JSON file.",
        variant: "destructive",
      });
    }
  };

  const totalRecords = exportResults.reduce((sum, r) => sum + r.count, 0);
  const hasData = exportResults.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Export Tool
          </CardTitle>
          <CardDescription>
            Export your complete Supabase database for use with the standalone backend.
            This will extract all tables and prepare them for import into your new database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Button */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              size="lg"
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Database className="h-4 w-4 mr-2 animate-spin" />
                  Exporting Database...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Start Database Export
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isExporting && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  {currentTable ? `Exporting: ${currentTable}` : 'Preparing export...'}
                  {progress > 0 && ` (${Math.round(progress)}%)`}
                </div>
              </div>
            )}
          </div>

          {/* MySQL Schema Download */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Database Schema</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download the MySQL CREATE TABLE statements to recreate your database structure in MySQL.
            </p>
            <Button variant="outline" onClick={downloadMySQLSchema} className="w-full">
              <Code className="h-4 w-4 mr-2" />
              Download MySQL Schema Script
            </Button>
          </div>

          {/* Complete SQL Script Download */}
          {hasData && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Complete MySQL Script</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download a complete MySQL script that creates tables and inserts all data in one go.
              </p>
              <Button onClick={downloadCompleteSQLScript} className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Download Complete SQL Script (Schema + Data)
              </Button>
            </div>
          )}

          {/* Export Results */}
          {hasData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Export Complete</h3>
                <Badge variant="secondary">
                  {totalRecords} total records
                </Badge>
              </div>

              {/* Download Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={downloadCSVFiles} className="h-auto p-4">
                  <div className="text-center">
                    <Table className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Download CSV Files</div>
                    <div className="text-xs text-gray-500">Separate file per table</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={downloadSQLFile} className="h-auto p-4">
                  <div className="text-center">
                    <Database className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Download SQL File</div>
                    <div className="text-xs text-gray-500">Ready for database import</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={downloadJSONFile} className="h-auto p-4">
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Download JSON</div>
                    <div className="text-xs text-gray-500">Complete data backup</div>
                  </div>
                </Button>
              </div>

              {/* Table Summary */}
              <div className="space-y-2">
                <h4 className="font-medium">Exported Tables:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {exportResults.map((result) => (
                    <div key={result.tableName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">{result.tableName}</span>
                      <Badge variant={result.count > 0 ? "default" : "secondary"} className="text-xs">
                        {result.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Download the Complete SQL Script above (includes schema + data)</li>
                  <li>2. Create a new MySQL database</li>
                  <li>3. Run the complete script in your MySQL database</li>
                  <li>4. Update the database connection in your extracted backend code</li>
                  <li>5. Start your standalone backend server</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseExportTool;
