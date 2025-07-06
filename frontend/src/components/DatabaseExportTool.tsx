
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface ExportConfig {
  tables: string[];
  format: 'csv' | 'json' | 'sql';
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  includeSchema: boolean;
  compressOutput: boolean;
}

interface TableInfo {
  name: string;
  rowCount: number;
  size: string;
  description: string;
}

const DatabaseExportTool: React.FC = () => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    tables: [],
    format: 'csv',
    dateRange: '30d',
    includeSchema: false,
    compressOutput: true
  });
  const [availableTables, setAvailableTables] = useState<TableInfo[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchAvailableTables();
  }, []);

  const fetchAvailableTables = async () => {
    setIsLoading(true);
    try {
      const response = await ApiClient.get('/api/admin/database/tables');
      setAvailableTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      // Mock data for development
      setAvailableTables([
        { name: 'employees', rowCount: 1250, size: '2.5 MB', description: 'Employee information and profiles' },
        { name: 'issues', rowCount: 8500, size: '12.3 MB', description: 'Support tickets and issues' },
        { name: 'sentiment_feedback', rowCount: 15000, size: '5.8 MB', description: 'Employee feedback and ratings' },
        { name: 'issue_comments', rowCount: 25000, size: '8.9 MB', description: 'Comments on issues' },
        { name: 'audit_logs', rowCount: 50000, size: '15.2 MB', description: 'System audit trail' },
        { name: 'master_cities', rowCount: 50, size: '10 KB', description: 'City master data' },
        { name: 'master_clusters', rowCount: 200, size: '25 KB', description: 'Cluster master data' },
        { name: 'master_roles', rowCount: 15, size: '5 KB', description: 'Role master data' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableSelection = (tableName: string, checked: boolean) => {
    setExportConfig(prev => ({
      ...prev,
      tables: checked 
        ? [...prev.tables, tableName]
        : prev.tables.filter(t => t !== tableName)
    }));
  };

  const selectAllTables = () => {
    setExportConfig(prev => ({
      ...prev,
      tables: availableTables.map(t => t.name)
    }));
  };

  const clearSelection = () => {
    setExportConfig(prev => ({
      ...prev,
      tables: []
    }));
  };

  const startExport = async () => {
    if (exportConfig.tables.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);

      const response = await ApiClient.post('/api/admin/database/export', exportConfig, {
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = exportConfig.compressOutput ? 'zip' : exportConfig.format;
      link.download = `database_export_${timestamp}.${extension}`;
      
      link.click();
      window.URL.revokeObjectURL(url);

      // Reset progress after download
      setTimeout(() => {
        setExportProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedSize = () => {
    const selectedTables = availableTables.filter(t => exportConfig.tables.includes(t.name));
    let totalSizeKB = 0;
    
    selectedTables.forEach(table => {
      const sizeStr = table.size;
      const size = parseFloat(sizeStr);
      if (sizeStr.includes('MB')) {
        totalSizeKB += size * 1024;
      } else if (sizeStr.includes('KB')) {
        totalSizeKB += size;
      }
    });

    if (totalSizeKB > 1024) {
      return `${(totalSizeKB / 1024).toFixed(1)} MB`;
    }
    return `${totalSizeKB.toFixed(0)} KB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Export Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Export Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Select Tables</h3>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllTables}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableTables.map((table) => (
              <div 
                key={table.name}
                className="flex items-start space-x-3 p-3 border rounded-lg"
              >
                <Checkbox
                  id={table.name}
                  checked={exportConfig.tables.includes(table.name)}
                  onCheckedChange={(checked) => 
                    handleTableSelection(table.name, checked as boolean)
                  }
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={table.name} className="cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{table.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {table.rowCount.toLocaleString()} rows
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {table.size}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{table.description}</p>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select 
              value={exportConfig.format} 
              onValueChange={(value: any) => setExportConfig(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                <SelectItem value="sql">SQL (Database Dump)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select 
              value={exportConfig.dateRange} 
              onValueChange={(value: any) => setExportConfig(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSchema"
              checked={exportConfig.includeSchema}
              onCheckedChange={(checked) => 
                setExportConfig(prev => ({ ...prev, includeSchema: checked as boolean }))
              }
            />
            <label htmlFor="includeSchema" className="text-sm cursor-pointer">
              Include database schema (CREATE TABLE statements)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="compressOutput"
              checked={exportConfig.compressOutput}
              onCheckedChange={(checked) => 
                setExportConfig(prev => ({ ...prev, compressOutput: checked as boolean }))
              }
            />
            <label htmlFor="compressOutput" className="text-sm cursor-pointer">
              Compress output file (ZIP format)
            </label>
          </div>
        </div>

        {/* Export Summary */}
        {exportConfig.tables.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Selected Tables:</span>
                <span className="ml-2 font-medium">{exportConfig.tables.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Estimated Size:</span>
                <span className="ml-2 font-medium">{getEstimatedSize()}</span>
              </div>
              <div>
                <span className="text-gray-600">Format:</span>
                <span className="ml-2 font-medium uppercase">{exportConfig.format}</span>
              </div>
              <div>
                <span className="text-gray-600">Compressed:</span>
                <span className="ml-2 font-medium">{exportConfig.compressOutput ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exporting {exportConfig.tables.length} tables...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} />
          </div>
        )}

        {/* Export Button */}
        <Button 
          onClick={startExport}
          disabled={exportConfig.tables.length === 0 || isExporting}
          className="w-full"
        >
          {isExporting ? (
            'Exporting...'
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {exportConfig.tables.length} Tables
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatabaseExportTool;
