
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedFilters } from "./AdvancedAnalyticsSection";
import {
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopicRadarChart from "@/components/charts/TopicRadarChart";
import TopicBarChart from "@/components/charts/TopicBarChart";
import SentimentPieChart from "@/components/charts/SentimentPieChart";

interface AdvancedAnalyticsChartsProps {
  filters: AdvancedFilters;
}

// Mock data for demonstration purposes
const generateMockTimeSeriesData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      tickets: Math.floor(Math.random() * 50) + 10,
      sla: Math.floor(Math.random() * 100),
      responseTime: Math.floor(Math.random() * 24) + 1,
      resolutionTime: Math.floor(Math.random() * 72) + 4,
    });
  }
  return data;
};

const MOCK_TIME_SERIES = generateMockTimeSeriesData(30);

const MOCK_ISSUE_TYPES = [
  { name: "Technical", value: 35 },
  { name: "Billing", value: 25 },
  { name: "Account", value: 20 },
  { name: "Feature Request", value: 15 },
  { name: "Other", value: 5 },
];

const MOCK_TOPIC_DATA = [
  { subject: "Login Issues", count: 45, fullMark: 100 },
  { subject: "Payment Failures", count: 38, fullMark: 100 },
  { subject: "App Crashes", count: 65, fullMark: 100 },
  { subject: "Account Access", count: 27, fullMark: 100 },
  { subject: "Feature Requests", count: 18, fullMark: 100 },
];

const MOCK_SENTIMENT_DATA = [
  { name: "Positive", value: 55 },
  { name: "Neutral", value: 30 },
  { name: "Negative", value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AdvancedAnalyticsCharts: React.FC<AdvancedAnalyticsChartsProps> = ({ filters }) => {
  // In a real implementation, we would fetch data based on filters
  // For now, we'll just use mock data

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Ticket Trends</TabsTrigger>
          <TabsTrigger value="sla">SLA Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={MOCK_TIME_SERIES}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#1E40AF" 
                    activeDot={{ r: 8 }} 
                    name="Ticket Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={MOCK_TIME_SERIES}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#F59E0B" 
                      name="Avg Response Time (hrs)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resolution Time Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={MOCK_TIME_SERIES}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="resolutionTime" 
                      stroke="#10B981" 
                      name="Avg Resolution Time (hrs)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sla" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={MOCK_TIME_SERIES}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'SLA Compliance']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sla" 
                    stroke="#1E40AF" 
                    activeDot={{ r: 8 }} 
                    name="SLA Compliance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Topics by Volume</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TopicBarChart data={MOCK_TOPIC_DATA.map(item => ({ name: item.subject, count: item.count }))} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TopicRadarChart data={MOCK_TOPIC_DATA} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_ISSUE_TYPES}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {MOCK_ISSUE_TYPES.map((entry, index) => (
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
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <SentimentPieChart data={MOCK_SENTIMENT_DATA} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time by Issue Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_ISSUE_TYPES.map(type => ({
                    name: type.name,
                    time: Math.floor(Math.random() * 72) + 4
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="time" name="Avg Resolution Time (hrs)" fill="#1E40AF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
