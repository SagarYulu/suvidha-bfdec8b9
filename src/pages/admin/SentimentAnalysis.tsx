
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import SentimentFilterBar from '@/components/admin/sentiment/SentimentFilterBar';
import SentimentOverview from '@/components/admin/sentiment/SentimentOverview';
import SentimentAlerts from '@/components/admin/sentiment/SentimentAlerts';
import RecentFeedback from '@/components/admin/sentiment/RecentFeedback';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { fetchAllSentiment } from '@/services/sentimentService';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const SentimentAnalysis: React.FC = () => {
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  }>({});
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-hide debug info after 10 seconds
      setShowDebugInfo(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const exportMutation = useMutation({
    mutationFn: async () => {
      console.log("Starting export with filters:", filters);
      const data = await fetchAllSentiment(filters);
      return data;
    },
    onSuccess: (data) => {
      // Transform data for CSV export
      const csvData = data.map(item => ({
        Date: item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
        Rating: item.rating,
        Sentiment: item.sentiment_label || '',
        SentimentScore: item.sentiment_score || '',
        City: item.city || '',
        Cluster: item.cluster || '',
        Role: item.role || '',
        Tags: item.tags ? item.tags.join(', ') : '',
        Feedback: item.feedback || ''
      }));
      
      // Convert to CSV
      const csv = Papa.unparse(csvData);
      
      // Create file and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `sentiment-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      
      toast({
        title: "Export Successful",
        description: `Sentiment data has been exported to CSV (${csvData.length} records).`
      });
    },
    onError: (error) => {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleFilterChange = (newFilters: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  }) => {
    console.log("Filter change:", JSON.stringify(newFilters, null, 2));
    setFilters(newFilters);
    
    // Invalidate queries to refresh data with new filters
    queryClient.invalidateQueries({ queryKey: ['sentiment', newFilters] });
    queryClient.invalidateQueries({ queryKey: ['sentiment-feedback', newFilters] });
  };
  
  const handleExport = () => {
    exportMutation.mutate();
  };

  const forceRefresh = () => {
    // Force refetch all sentiment data
    queryClient.invalidateQueries({ queryKey: ['sentiment'] });
    queryClient.invalidateQueries({ queryKey: ['sentiment-feedback'] });
    
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest sentiment data from the database."
    });
  };
  
  return (
    <AdminLayout 
      title="Sentiment Analysis" 
      requiredPermission="manage:analytics"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Sentiment Analysis</h1>
        <div className="space-x-2">
          <Button 
            variant="outline"
            onClick={forceRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button 
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      <SentimentFilterBar onFilterChange={handleFilterChange} />
      
      {/* Debug info panel with toggle */}
      <div className="mb-4 flex items-start">
        <Checkbox 
          id="show-debug" 
          checked={showDebugInfo}
          onCheckedChange={(checked) => setShowDebugInfo(!!checked)}
          className="mt-1 mr-2"
        />
        <label htmlFor="show-debug" className="text-sm text-gray-500 cursor-pointer">
          Show debug information
        </label>
      </div>
      
      {showDebugInfo && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <p><strong>Active Filters:</strong></p>
          <pre className="mt-2 bg-gray-200 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(filters, null, 2)}
          </pre>
          <p className="mt-2 text-xs text-gray-500">
            Note: If no data appears, check that employee records have city, cluster, and role information.
            Filter matches are case-insensitive partial matches.
          </p>
        </div>
      )}
      
      <SentimentAlerts />
      
      <div className="my-6">
        <SentimentOverview filters={filters} />
      </div>
      
      <RecentFeedback filters={filters} />
    </AdminLayout>
  );
};

export default SentimentAnalysis;
