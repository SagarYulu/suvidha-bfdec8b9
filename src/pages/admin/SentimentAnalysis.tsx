
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart, 
  Bar,
  Cell
} from 'recharts';

const SentimentAnalysis: React.FC = () => {
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  }>({});
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-hide debug info after 10 seconds
      setShowDebugInfo(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch sentiment data based on filters
  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        const data = await fetchAllSentiment(filters);
        setSentimentData(data);
      } catch (error) {
        console.error("Error loading sentiment data:", error);
      }
    };
    
    loadSentimentData();
  }, [filters]);

  // Calculate trend data
  const getTimeSeriesData = () => {
    const sentimentByDate = sentimentData.reduce((acc, curr) => {
      if (!curr.created_at) return acc;
      
      const date = format(new Date(curr.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { 
          count: 0, 
          totalRating: 0, 
          totalScore: 0
        };
      }
      acc[date].count++;
      acc[date].totalRating += curr.rating;
      if (curr.sentiment_score !== null && curr.sentiment_score !== undefined) {
        acc[date].totalScore += curr.sentiment_score;
      }
      return acc;
    }, {} as Record<string, { count: number; totalRating: number; totalScore: number }>);

    // Convert to array for charts with simpler labels
    return Object.keys(sentimentByDate)
      .sort()
      .map(date => ({
        date,
        rating: (sentimentByDate[date].totalRating / sentimentByDate[date].count).toFixed(1),
        count: sentimentByDate[date].count,
      }));
  };

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
      
      {/* Employee Mood Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Mood Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {sentimentData && sentimentData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getTimeSeriesData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(value) => {
                      const labels = {
                        1: "Very Low",
                        2: "Low",
                        3: "Neutral",
                        4: "Good", 
                        5: "Excellent"
                      };
                      return labels[value as keyof typeof labels] || value;
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => [`Average Rating: ${value}`, "Employee Mood"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#8884d8"
                    name="Employee Mood Rating (1-5)"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No sentiment data available for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combined Topic & Mood Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Topic Mood Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {sentimentData && sentimentData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTopicMoodData()}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === "highMood") return [`${value} positive mentions`, "Positive (4-5)"];
                      if (name === "neutralMood") return [`${value} neutral mentions`, "Neutral (3)"];
                      if (name === "lowMood") return [`${value} negative mentions`, "Negative (1-2)"];
                      return [`${value}`, name];
                    }}
                    labelFormatter={(label) => `Topic: ${label}`}
                  />
                  <Legend formatter={(value) => {
                    if (value === "lowMood") return "Negative (1-2)";
                    if (value === "neutralMood") return "Neutral (3)";
                    if (value === "highMood") return "Positive (4-5)";
                    return value;
                  }} />
                  <Bar 
                    dataKey="lowMood" 
                    name="lowMood" 
                    stackId="a" 
                    fill="#F44336" // Red for negative
                  />
                  <Bar 
                    dataKey="neutralMood" 
                    name="neutralMood" 
                    stackId="a" 
                    fill="#FFC107" // Yellow for neutral
                  />
                  <Bar 
                    dataKey="highMood" 
                    name="highMood" 
                    stackId="a" 
                    fill="#4CAF50" // Green for positive
                  />
                </BarChart>
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
      
      <div className="my-6">
        <SentimentOverview filters={filters} />
      </div>
      
      <RecentFeedback filters={filters} />
    </AdminLayout>
  );
};

export default SentimentAnalysis;
