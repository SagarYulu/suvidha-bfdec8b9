import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList
} from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';

interface TagTrendAnalysisProps {
  data: any[];
  isLoading: boolean;
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#F0F9FF'];
const SENTIMENT_COLORS = {
  'positive': '#4ADE80',  // Lighter green
  'neutral': '#FBBF24',   // Lighter yellow
  'negative': '#F87171'   // Lighter red
};

const TagTrendAnalysis: React.FC<TagTrendAnalysisProps> = ({ data, isLoading }) => {
  const [activeTab, setActiveTab] = useState('tags');
  const [tagDistribution, setTagDistribution] = useState<any[]>([]);
  const [topTags, setTopTags] = useState<any[]>([]);
  const [sentimentDistribution, setSentimentDistribution] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && data && data.length > 0) {
      processData();
    }
  }, [data, isLoading]);

  const processData = () => {
    // Process tag distribution
    const tagCounts: Record<string, number> = {};
    
    // Count all tags
    data.forEach(item => {
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
    
    // Sort by frequency
    const sortedTags = [...tagArray].sort((a, b) => b.value - a.value);
    
    // Set top 5 tags for pie chart
    setTagDistribution(sortedTags.slice(0, 5));
    
    // Set top 10 tags for bar chart
    setTopTags(sortedTags.slice(0, 10).map(item => ({
      name: item.name,
      count: item.value
    })));
    
    // Create radar data for top 5 tags
    setRadarData(sortedTags.slice(0, 5).map(item => ({
      subject: item.name,
      count: item.value,
      fullMark: Math.max(...sortedTags.map(t => t.value)) + 2
    })));
    
    // Process sentiment distribution
    const sentimentCounts: Record<string, number> = {};
    
    data.forEach(item => {
      let label = item.sentiment_label?.toLowerCase() || 'unknown';
      // Simplify to positive, negative, neutral
      if (label.includes('positive')) label = 'positive';
      if (label.includes('negative')) label = 'negative';
      if (label.includes('neutral')) label = 'neutral';
      
      sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
    });
    
    // Convert to array for charts
    const sentimentArray = Object.keys(sentimentCounts).map(label => ({
      name: label.charAt(0).toUpperCase() + label.slice(1),
      value: sentimentCounts[label]
    }));
    
    setSentimentDistribution(sentimentArray);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <Loader2 className="h-8 w-8 animate-spin text-white mb-4" />
        <p className="text-white text-center">Loading trend analysis data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-white text-center">
        <BarChart2 className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">No Data Available</h3>
        <p>There is no feedback data available for trend analysis.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      <h2 className="text-xl font-semibold mb-4 text-white text-center">Feedback Analysis</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/25 p-1 mb-4">
          <TabsTrigger value="tags" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Topic Analysis
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Sentiment Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tags" className="space-y-4">
          {/* Radar chart for mobile */}
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-800">Topic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} width={500} height={250} data={radarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#6B7280', fontSize: 10 }} />
                      <Radar
                        name="Topic Frequency"
                        dataKey="count"
                        stroke="#2563EB"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} mentions`, "Frequency"]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No topic data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-800">Topic Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-x-auto">
                {topTags.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topTags}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis 
                        type="number"
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} mentions`, "Count"]}
                        contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                      />
                      <Bar dataKey="count" name="Mentions">
                        {topTags.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${210 - index * (150 / topTags.length)}, 80%, 55%)`}
                            radius={[0, 4, 4, 0]}
                          />
                        ))}
                        <LabelList 
                          dataKey="count" 
                          position="right" 
                          style={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }}
                          offset={10}
                          formatter={(value) => {
                            // Fix: Ensure we always return a string, never an array
                            return String(value);
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No topic data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sentiment" className="space-y-4">
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-800">Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {sentimentDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sentimentDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name.toLowerCase() === 'positive' ? SENTIMENT_COLORS.positive :
                              entry.name.toLowerCase() === 'negative' ? SENTIMENT_COLORS.negative :
                              entry.name.toLowerCase() === 'neutral' ? SENTIMENT_COLORS.neutral :
                              COLORS[index % COLORS.length]
                            } 
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} responses`, "Count"]}
                        contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No sentiment data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-medium text-gray-800">About This Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This analysis shows the distribution of feedback sentiment and topics from the last 30 days.
                The charts provide insights into the most common feedback topics and the overall sentiment
                of employee feedback.
              </p>
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-xs text-blue-700">
                  Based on {data.length} feedback submissions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TagTrendAnalysis;
