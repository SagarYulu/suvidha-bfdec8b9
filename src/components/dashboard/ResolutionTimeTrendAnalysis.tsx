
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChartLine } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { exportResolutionTimeTrendToCSV } from "@/utils/csvHelpers";

// Define the data structure
interface TrendDataPoint {
  name: string;
  time: number;
  volume?: number;
  isOutlier?: boolean;
}

interface ResolutionTimeTrendProps {
  dailyData: TrendDataPoint[];
  weeklyData: TrendDataPoint[];
  monthlyData: TrendDataPoint[];
  quarterlyData: TrendDataPoint[];
  isLoading: boolean;
}

const ResolutionTimeTrendAnalysis: React.FC<ResolutionTimeTrendProps> = ({
  dailyData,
  weeklyData,
  monthlyData,
  quarterlyData,
  isLoading
}) => {
  // State for active time period
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('daily');
  
  // Helper to get the current dataset based on active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'daily': return dailyData;
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      case 'quarterly': return quarterlyData;
      default: return dailyData;
    }
  };
  
  // Helper to format tab labels
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'daily': return 'Day by Day';
      case 'weekly': return 'Week by Week';
      case 'monthly': return 'Month by Month';
      case 'quarterly': return 'Quarterly';
      default: return tab;
    }
  };
  
  // Function to handle CSV export
  const handleExport = () => {
    exportResolutionTimeTrendToCSV(getActiveData(), activeTab);
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Resolution Time Trend Analysis</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="daily">{getTabLabel('daily')}</TabsTrigger>
            <TabsTrigger value="weekly">{getTabLabel('weekly')}</TabsTrigger>
            <TabsTrigger value="monthly">{getTabLabel('monthly')}</TabsTrigger>
            <TabsTrigger value="quarterly">{getTabLabel('quarterly')}</TabsTrigger>
          </TabsList>
          
          {['daily', 'weekly', 'monthly', 'quarterly'].map(period => (
            <TabsContent key={period} value={period} className="space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-[400px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <>
                  {/* Line Chart for Resolution Time Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={getActiveData()}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                          <Tooltip 
                            formatter={(value: number) => [`${value.toFixed(2)} hours`, 'Resolution Time']}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="time"
                            name="Resolution Time"
                            stroke="#1E40AF"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              // Highlight outliers where resolution time exceeds 72 hours
                              if (payload.time > 72) {
                                return (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={6}
                                    stroke="red"
                                    strokeWidth={3}
                                    fill="#FFF"
                                  />
                                );
                              }
                              return (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={4}
                                  stroke="#1E40AF"
                                  strokeWidth={1}
                                  fill="#FFF"
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Bar Chart for Ticket Volume */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getActiveData()}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="volume"
                            name="Ticket Volume"
                            fill="#10B981"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Tabular Data View */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Ticket Volume</TableHead>
                            <TableHead>Avg. Resolution Time</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getActiveData().map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.volume || 0}</TableCell>
                              <TableCell>{item.time.toFixed(2)} hours</TableCell>
                              <TableCell>
                                {item.time > 72 ? (
                                  <Badge variant="destructive">Outlier</Badge>
                                ) : item.time > 48 ? (
                                  <Badge variant="warning" className="bg-yellow-500">Warning</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-100">Normal</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResolutionTimeTrendAnalysis;
