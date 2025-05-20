
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getAnalytics } from "@/services/issues/issueAnalyticsService";
import { getUsers } from "@/services/userService";
import { fetchAllSentiment } from "@/services/sentimentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import { ISSUE_TYPES } from "@/config/issueTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from 'date-fns';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('issues');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching analytics data...");
        const analyticsData = await getAnalytics();
        console.log("Analytics data received:", analyticsData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSentimentData = async () => {
      try {
        console.log("Fetching sentiment data...");
        // Get last 30 days of sentiment data
        const filters = {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        };
        const data = await fetchAllSentiment(filters);
        console.log("Sentiment data received:", data);
        setSentimentData(data || []);
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
      }
    };

    fetchAnalyticsData();
    fetchSentimentData();
  }, []);

  const COLORS = [
    '#1E40AF', '#3B82F6', '#93C5FD', '#BFDBFE', 
    '#FBBF24', '#F59E0B', '#D97706', 
    '#10B981', '#059669', '#047857'
  ];

  const SENTIMENT_COLORS = {
    'positive': '#4CAF50',
    'neutral': '#FFC107',
    'negative': '#F44336'
  };

  const getIssueTypeLabel = (typeId: string) => {
    const issueType = ISSUE_TYPES.find(type => type.id === typeId);
    return issueType?.label || typeId;
  };

  // Format data for charts
  const getTypePieData = () => {
    if (!analytics?.typeCounts) return [];
    
    return Object.entries(analytics.typeCounts).map(([typeId, count]: [string, any]) => ({
      name: getIssueTypeLabel(typeId),
      value: count
    }));
  };

  const getCityBarData = () => {
    if (!analytics?.cityCounts) return [];
    
    return Object.entries(analytics.cityCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  };

  const getClusterBarData = () => {
    if (!analytics?.clusterCounts) return [];
    
    return Object.entries(analytics.clusterCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  };

  const getManagerBarData = () => {
    if (!analytics?.managerCounts) return [];
    
    return Object.entries(analytics.managerCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  };

  // Process sentiment data for tag trend analysis
  const getTagDistribution = () => {
    const tagCounts: Record<string, number> = {};
    
    // Count all tags
    sentimentData.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    // Convert to array for charts
    const tagArray = Object.keys(tagCounts).map(tag => ({
      name: tag,
      value: tagCounts[tag]
    }));
    
    // Sort by frequency and return top 5
    return [...tagArray].sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const getTopTags = () => {
    const tagCounts: Record<string, number> = {};
    
    // Count all tags
    sentimentData.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    // Convert to array, sort by frequency, and get top 10
    return Object.keys(tagCounts)
      .map(tag => ({ name: tag, count: tagCounts[tag] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getSentimentDistribution = () => {
    const sentimentCounts: Record<string, number> = {};
    
    sentimentData.forEach(item => {
      let label = item.sentiment_label?.toLowerCase() || 'unknown';
      // Simplify to positive, negative, neutral
      if (label.includes('positive')) label = 'positive';
      if (label.includes('negative')) label = 'negative';
      if (label.includes('neutral')) label = 'neutral';
      
      sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
    });
    
    // Convert to array for charts
    return Object.keys(sentimentCounts).map(label => ({
      name: label.charAt(0).toUpperCase() + label.slice(1),
      value: sentimentCounts[label]
    }));
  };

  // Calculate average sentiment by date for line chart
  const getSentimentByDate = () => {
    const sentimentByDate = sentimentData.reduce((acc, curr) => {
      if (!curr.created_at) return acc;
      
      const date = format(parseISO(curr.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { count: 0, totalRating: 0 };
      }
      acc[date].count++;
      acc[date].totalRating += curr.rating;
      return acc;
    }, {} as Record<string, { count: number; totalRating: number; }>);

    // Convert to array for charts with simpler labels
    return Object.keys(sentimentByDate)
      .sort()
      .map(date => ({
        date,
        rating: (sentimentByDate[date].totalRating / sentimentByDate[date].count).toFixed(1),
      }));
  };

  return (
    <AdminLayout title="Analytics">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="issues" className="flex-1">Issue Analytics</TabsTrigger>
              <TabsTrigger value="sentiment" className="flex-1">Sentiment Trend Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="issues">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics?.totalIssues || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">All issues raised</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Resolution Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {analytics ? (analytics.resolutionRate.toFixed(1) + '%') : '0%'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Issues resolved / total issues</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Avg Resolution Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics?.avgResolutionTime || '0'} hrs</div>
                    <p className="text-xs text-muted-foreground mt-1">Average time to close issues</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">First Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics?.avgFirstResponseTime || '0'} hrs</div>
                    <p className="text-xs text-muted-foreground mt-1">Average time to first response</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Open Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics?.openIssues || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Issues pending resolution</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Type</CardTitle>
                    <CardDescription>Distribution of issues by category</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTypePieData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {getTypePieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by City</CardTitle>
                    <CardDescription>Distribution of issues across cities</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getCityBarData()}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 50,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Issues" fill="#1E40AF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by City</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getCityBarData()}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 50,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Issues" fill="#1E40AF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Cluster</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getClusterBarData()}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 50,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Issues" fill="#FBBF24" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Manager</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getManagerBarData()}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 50,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Issues" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sentiment">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Trend Over Time */}
                <Card className="col-span-1 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Employee Mood Trend</CardTitle>
                    <CardDescription>Average sentiment rating over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={getSentimentByDate()}
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
                  </CardContent>
                </Card>

                {/* Top Feedback Tags Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Feedback Topics</CardTitle>
                    <CardDescription>Most mentioned topics in feedback</CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <div className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getTagDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getTagDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Sentiment</CardTitle>
                    <CardDescription>Distribution of feedback sentiment</CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <div className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getSentimentDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getSentimentDistribution().map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.name.toLowerCase() === 'positive' ? SENTIMENT_COLORS.positive :
                                  entry.name.toLowerCase() === 'negative' ? SENTIMENT_COLORS.negative :
                                  entry.name.toLowerCase() === 'neutral' ? SENTIMENT_COLORS.neutral :
                                  COLORS[index % COLORS.length]
                                } 
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Tag Frequency Bar Chart */}
                <Card className="col-span-1 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Topic Frequency</CardTitle>
                    <CardDescription>Number of times each topic appears in feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getTopTags()}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} mentions`, "Count"]}
                          />
                          <Legend />
                          <Bar 
                            dataKey="count" 
                            name="Mentions" 
                            fill="#1E40AF"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
