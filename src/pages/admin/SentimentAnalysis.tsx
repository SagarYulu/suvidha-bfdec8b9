
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ComparisonModeDropdown, { ComparisonMode } from '@/components/admin/sentiment/ComparisonModeDropdown';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LabelList
} from 'recharts';

const SentimentAnalysis: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
    comparisonMode?: ComparisonMode;
  }>({
    startDate: today,
    endDate: today,
    comparisonMode: 'none'
  });
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  
  const queryClient = useQueryClient();
  
  // Fetch sentiment data based on filters
  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        const data = await fetchAllSentiment(filters);
        setSentimentData(data);
      } catch (error) {
        console.error("Error loading sentiment data:", error);
        setSentimentData([]);
      }
    };
    
    loadSentimentData();
  }, [filters]);

  // Calculate tag distribution with mood distribution
  const getTopicMoodData = () => {
    // Initialize data structure for topics and their mood distributions
    const topicMoodMap: Record<string, { 
      name: string, 
      count: number,
      highMood: number,  // Rating 4-5
      neutralMood: number, // Rating 3
      lowMood: number,  // Rating 1-2
    }> = {};
    
    let taggedFeedbackCount = 0;
    
    sentimentData.forEach(item => {
      if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
        taggedFeedbackCount++;
        
        item.tags.forEach(tag => {
          if (!tag) return;
          
          if (!topicMoodMap[tag]) {
            topicMoodMap[tag] = { 
              name: tag, 
              count: 0,
              highMood: 0,
              neutralMood: 0,
              lowMood: 0
            };
          }
          
          topicMoodMap[tag].count++;
          
          // Categorize by mood
          if (item.rating >= 4) {
            topicMoodMap[tag].highMood++;
          } else if (item.rating === 3) {
            topicMoodMap[tag].neutralMood++;
          } else {
            topicMoodMap[tag].lowMood++;
          }
        });
      }
    });
    
    // For sentiment with no tags, create default categories
    if (taggedFeedbackCount === 0 && sentimentData.length > 0) {
      console.log("No tagged feedback found, creating default categories");
      
      // Count sentiment label distribution for default categories
      sentimentData.forEach(item => {
        const label = item.sentiment_label?.toLowerCase() || 'unknown';
        const tagName = `${label.charAt(0).toUpperCase() + label.slice(1)} Feedback`;
        
        if (!topicMoodMap[tagName]) {
          topicMoodMap[tagName] = { 
            name: tagName, 
            count: 0,
            highMood: 0,
            neutralMood: 0,
            lowMood: 0
          };
        }
        
        topicMoodMap[tagName].count++;
        
        // Categorize by mood
        if (item.rating >= 4) {
          topicMoodMap[tagName].highMood++;
        } else if (item.rating === 3) {
          topicMoodMap[tagName].neutralMood++;
        } else {
          topicMoodMap[tagName].lowMood++;
        }
      });
    }

    return Object.values(topicMoodMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 topics
  };
  
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
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    
    // Invalidate queries to refresh data with new filters
    queryClient.invalidateQueries({ queryKey: ['sentiment', newFilters] });
    queryClient.invalidateQueries({ queryKey: ['sentiment-feedback', newFilters] });
    
    // Also invalidate previous period data if comparison mode is active
    if (filters.comparisonMode !== 'none') {
      queryClient.invalidateQueries({ queryKey: ['sentiment-previous'] });
    }
  };

  const handleComparisonModeChange = (mode: ComparisonMode) => {
    console.log("Comparison mode changed to:", mode);
    setFilters(prevFilters => ({
      ...prevFilters,
      comparisonMode: mode
    }));

    // Invalidate queries to refresh data with new comparison mode
    queryClient.invalidateQueries({ queryKey: ['sentiment', { ...filters, comparisonMode: mode }] });
    if (mode !== 'none') {
      queryClient.invalidateQueries({ queryKey: ['sentiment-previous'] });
    }
    
    // Additional invalidation to ensure comparison data is fetched immediately
    if (mode !== 'none') {
      queryClient.invalidateQueries({ 
        queryKey: ['sentiment-previous', { 
          ...filters, 
          comparisonMode: mode 
        }]
      });
    }
  };
  
  const handleExport = () => {
    exportMutation.mutate();
  };

  const forceRefresh = () => {
    // Force refetch all sentiment data
    queryClient.invalidateQueries({ queryKey: ['sentiment'] });
    queryClient.invalidateQueries({ queryKey: ['sentiment-feedback'] });
    queryClient.invalidateQueries({ queryKey: ['sentiment-previous'] });
    
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest sentiment data from the database."
    });
  };
  
  // Custom tooltip for the topic mood chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const topic = payload[0].payload;
      const total = topic.lowMood + topic.neutralMood + topic.highMood;
      
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="grid gap-1 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <p className="text-sm">Negative (1-2): {topic.lowMood} ({Math.round(topic.lowMood/total*100)}%)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <p className="text-sm">Neutral (3): {topic.neutralMood} ({Math.round(topic.neutralMood/total*100)}%)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <p className="text-sm">Positive (4-5): {topic.highMood} ({Math.round(topic.highMood/total*100)}%)</p>
            </div>
            <div className="mt-1 pt-1 border-t border-gray-200">
              <p className="text-sm font-medium">Total mentions: {total}</p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
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
      
      <div className="mb-6 grid grid-cols-1 gap-4">
        {/* Filters */}
        <SentimentFilterBar onFilterChange={handleFilterChange} />
        
        {/* Comparison Mode - Now properly connected to data fetch logic */}
        <Card className="p-4">
          <ComparisonModeDropdown 
            value={filters.comparisonMode || 'none'} 
            onChange={handleComparisonModeChange} 
          />
        </Card>
      </div>
      
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
          <p className="mt-2"><strong>Data Count:</strong> {sentimentData?.length || 0} records</p>
          <p className="mt-2 text-xs text-gray-500">
            Note: If no data appears, check that employee records have city, cluster, and role information.
            Filter matches are case-insensitive partial matches.
          </p>
        </div>
      )}

      {/* Improved Topic & Mood Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Topic Mood Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {sentimentData && sentimentData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={getTopicMoodData()}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    width={100}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(value) => {
                      if (value === "lowMood") return "Negative (1-2)";
                      if (value === "neutralMood") return "Neutral (3)";
                      if (value === "highMood") return "Positive (4-5)";
                      return value;
                    }} 
                  />
                  <Bar 
                    dataKey="lowMood" 
                    name="lowMood" 
                    stackId="a" 
                    fill="#F87171" // Lighter red
                    radius={[0, 0, 0, 0]}
                  >
                    <LabelList 
                      dataKey="lowMood" 
                      position="center" 
                      style={{ fill: 'white', fontSize: 11, fontWeight: 'bold' }}
                      formatter={(value: number) => (value > 0 ? value : '')}
                    />
                  </Bar>
                  <Bar 
                    dataKey="neutralMood" 
                    name="neutralMood" 
                    stackId="a" 
                    fill="#FBBF24" // Lighter yellow
                    radius={[0, 0, 0, 0]}
                  >
                    <LabelList 
                      dataKey="neutralMood" 
                      position="center" 
                      style={{ fill: 'white', fontSize: 11, fontWeight: 'bold' }}
                      formatter={(value: number) => (value > 0 ? value : '')}
                    />
                  </Bar>
                  <Bar 
                    dataKey="highMood" 
                    name="highMood" 
                    stackId="a" 
                    fill="#4ADE80" // Lighter green
                    radius={[0, 0, 0, 0]}
                  >
                    <LabelList 
                      dataKey="highMood" 
                      position="center" 
                      style={{ fill: 'white', fontSize: 11, fontWeight: 'bold' }}
                      formatter={(value: number) => (value > 0 ? value : '')}
                    />
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No topic data available for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>
      
      <SentimentAlerts />
      
      {/* SentimentOverview component displays the main charts with comparison */}
      <div className="my-6">
        <SentimentOverview filters={filters} />
      </div>
      
      <RecentFeedback filters={filters} />
    </AdminLayout>
  );
};

export default SentimentAnalysis;
