
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Users, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Exports = () => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState({});

  const exportOptions = [
    {
      id: 'issues',
      title: 'Issues Export',
      description: 'Export all issues data including status, priority, and comments',
      icon: Ticket,
      formats: ['CSV', 'Excel', 'PDF']
    },
    {
      id: 'users',
      title: 'Users Export',
      description: 'Export user data including roles and contact information',
      icon: Users,
      formats: ['CSV', 'Excel']
    },
    {
      id: 'analytics',
      title: 'Analytics Export',
      description: 'Export analytics and performance metrics',
      icon: FileText,
      formats: ['CSV', 'Excel', 'PDF']
    }
  ];

  const recentExports = [
    {
      id: 1,
      name: 'Issues_Export_2024-01-15.xlsx',
      type: 'Issues',
      date: new Date('2024-01-15'),
      size: '2.3 MB',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Users_Export_2024-01-10.csv',
      type: 'Users',
      date: new Date('2024-01-10'),
      size: '1.1 MB',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Analytics_Report_2024-01-05.pdf',
      type: 'Analytics',
      date: new Date('2024-01-05'),
      size: '5.2 MB',
      status: 'completed'
    }
  ];

  const handleExport = async (type, format) => {
    const key = `${type}_${format}`;
    setExporting(prev => ({ ...prev, [key]: true }));

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export Successful",
        description: `${type} data exported as ${format} format`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Exports</h1>
        <p className="text-gray-600">Export system data in various formats</p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{option.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                <div className="space-y-2">
                  {option.formats.map((format) => {
                    const key = `${option.id}_${format}`;
                    const isExporting = exporting[key];
                    
                    return (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport(option.title, format)}
                        disabled={isExporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isExporting ? 'Exporting...' : `Export as ${format}`}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Exports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExports.map((exportItem) => (
              <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{exportItem.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Badge variant="outline">{exportItem.type}</Badge>
                      <span>•</span>
                      <span>{exportItem.date.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{exportItem.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{exportItem.status}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exports;
