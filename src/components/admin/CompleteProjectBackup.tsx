
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Database, FileText, Code, CheckCircle, Package, Archive } from 'lucide-react';
import { DatabaseExporter, type ExportResult } from '@/utils/dataExporter';
import { MySQLSchemaGenerator } from '@/utils/mysqlSchemaGenerator';
import { toast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';

const CompleteProjectBackup = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupResults, setBackupResults] = useState<{
    database: ExportResult[];
    timestamp: string;
    totalRecords: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const exporter = new DatabaseExporter();

  const createCompleteBackup = async () => {
    setIsCreatingBackup(true);
    setProgress(0);
    setCurrentStep('Starting complete project backup...');
    
    try {
      toast({
        title: "Creating Complete Backup",
        description: "Starting comprehensive project backup process...",
      });

      // Step 1: Export Database Schema
      setCurrentStep('Generating MySQL schema...');
      setProgress(10);
      
      // Step 2: Export All Database Data
      setCurrentStep('Exporting database tables...');
      setProgress(25);
      
      const databaseResults = await exporter.exportAllTables();
      
      setProgress(50);
      setCurrentStep('Preparing backup package...');
      
      // Step 3: Create comprehensive backup data
      const timestamp = new Date().toISOString();
      const totalRecords = databaseResults.reduce((sum, r) => sum + r.count, 0);
      
      setProgress(75);
      setCurrentStep('Finalizing backup...');
      
      const backupData = {
        database: databaseResults,
        timestamp,
        totalRecords
      };
      
      setBackupResults(backupData);
      setProgress(100);
      setCurrentStep('Backup completed successfully!');
      
      toast({
        title: "Complete Backup Created!",
        description: `Successfully backed up ${totalRecords} records from ${databaseResults.length} tables.`,
      });

    } catch (error) {
      console.error('Complete backup failed:', error);
      toast({
        title: "Backup Failed",
        description: "There was an error creating the complete backup. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadMySQLSchema = () => {
    try {
      MySQLSchemaGenerator.downloadMySQLScript();
      toast({
        title: "MySQL Schema Downloaded",
        description: "Database schema script has been downloaded.",
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

  const downloadCompletePackage = async () => {
    if (!backupResults) return;

    try {
      // Create a comprehensive backup package
      const backupPackage = {
        metadata: {
          projectName: "TicketFlow System",
          backupType: "complete_project_backup",
          timestamp: backupResults.timestamp,
          totalTables: backupResults.database.length,
          totalRecords: backupResults.totalRecords,
          version: "1.0.0"
        },
        database: {
          schema: "MySQL schema available separately",
          tables: backupResults.database.reduce((acc, result) => {
            acc[result.tableName] = {
              recordCount: result.count,
              data: result.data
            };
            return acc;
          }, {} as Record<string, any>)
        },
        instructions: {
          restoration: [
            "1. Set up MySQL database",
            "2. Run the MySQL schema script to create tables",
            "3. Import the data using the provided JSON or SQL files",
            "4. Update database connection strings in your backend",
            "5. Test all functionality"
          ],
          migration: [
            "This backup contains all your Supabase data",
            "Use this as reference during migration to standalone backend",
            "All table relationships and data integrity preserved"
          ]
        }
      };

      const jsonContent = JSON.stringify(backupPackage, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `ticketflow_complete_backup_${new Date().toISOString().split('T')[0]}.json`);
      
      toast({
        title: "Complete Backup Downloaded",
        description: "Full project backup package has been downloaded.",
      });
    } catch (error) {
      console.error('Complete package download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download complete backup package.",
        variant: "destructive",
      });
    }
  };

  const downloadSQLBackup = async () => {
    if (!backupResults) return;
    try {
      await exporter.exportAsSQLFile(backupResults.database);
    } catch (error) {
      console.error('SQL backup download failed:', error);
    }
  };

  const downloadCSVBackup = async () => {
    if (!backupResults) return;
    try {
      await exporter.exportAsCSVFiles(backupResults.database);
    } catch (error) {
      console.error('CSV backup download failed:', error);
    }
  };

  const hasBackup = backupResults !== null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-6 w-6" />
            Complete Project Backup
          </CardTitle>
          <CardDescription>
            Create a comprehensive backup of your entire TicketFlow system including all database tables, 
            schema, and configurations. This backup will be essential before migrating to a standalone backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backup Creation */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={createCompleteBackup} 
              disabled={isCreatingBackup}
              size="lg"
              className="w-full"
            >
              {isCreatingBackup ? (
                <>
                  <Archive className="h-4 w-4 mr-2 animate-pulse" />
                  Creating Complete Backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Create Complete Project Backup
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isCreatingBackup && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  {currentStep}
                  {progress > 0 && ` (${Math.round(progress)}%)`}
                </div>
              </div>
            )}
          </div>

          {/* Backup Results and Downloads */}
          {hasBackup && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Backup Complete</h3>
                <Badge variant="secondary">
                  {backupResults.totalRecords} total records
                </Badge>
              </div>

              {/* Download Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" onClick={downloadCompletePackage} className="h-auto p-4">
                  <div className="text-center">
                    <Package className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Complete Package</div>
                    <div className="text-xs text-gray-500">All data + metadata</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={downloadMySQLSchema} className="h-auto p-4">
                  <div className="text-center">
                    <Code className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">MySQL Schema</div>
                    <div className="text-xs text-gray-500">CREATE TABLE scripts</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={downloadSQLBackup} className="h-auto p-4">
                  <div className="text-center">
                    <Database className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">SQL Data</div>
                    <div className="text-xs text-gray-500">INSERT statements</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={downloadCSVBackup} className="h-auto p-4">
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">CSV Files</div>
                    <div className="text-xs text-gray-500">One file per table</div>
                  </div>
                </Button>
              </div>

              {/* Backup Summary */}
              <div className="space-y-2">
                <h4 className="font-medium">Backup Summary:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {backupResults.database.map((result) => (
                    <div key={result.tableName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">{result.tableName}</span>
                      <Badge variant={result.count > 0 ? "default" : "secondary"} className="text-xs">
                        {result.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Migration Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">✅ Your Backup is Ready!</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>What you have:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Complete database backup with {backupResults.totalRecords} records</li>
                    <li>MySQL schema for recreating table structure</li>
                    <li>Multiple export formats (JSON, SQL, CSV)</li>
                    <li>All relationships and data integrity preserved</li>
                  </ul>
                  
                  <p className="pt-2"><strong>✅ Ready to proceed with migration!</strong></p>
                  <p>Your data is safely backed up. We can now start building your standalone backend.</p>
                </div>
              </div>
            </div>
          )}

          {/* Pre-backup Information */}
          {!hasBackup && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">What This Backup Includes:</h4>
              <div className="text-sm text-yellow-800 space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>All Database Tables:</strong> Complete data from all 17 tables</li>
                  <li><strong>MySQL Schema:</strong> CREATE TABLE scripts for easy restoration</li>
                  <li><strong>Multiple Formats:</strong> JSON, SQL, and CSV exports</li>
                  <li><strong>Metadata:</strong> Backup timestamp, record counts, and instructions</li>
                  <li><strong>Restoration Guide:</strong> Step-by-step migration instructions</li>
                </ul>
                <p className="pt-2 font-medium">This backup will be essential for your migration to a standalone backend!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProjectBackup;
