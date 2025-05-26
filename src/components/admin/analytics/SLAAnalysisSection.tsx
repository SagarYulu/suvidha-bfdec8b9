
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { useSLAAnalytics } from '@/hooks/useSLAAnalytics';
import { IssueFilters } from '@/services/issues/issueFilters';
import { AlertTriangle, CheckCircle, Clock, TrendingDown } from 'lucide-react';

interface SLAAnalysisSectionProps {
  filters: IssueFilters;
}

const SLAAnalysisSection: React.FC<SLAAnalysisSectionProps> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    slaOverviewData, 
    slaBreachTrendData, 
    slaPerformanceData,
    slaMetrics,
    isLoading 
  } = useSLAAnalytics(filters);

  const SLA_COLORS = {
    onTime: '#10B981',
    breached: '#EF4444',
    atRisk: '#F59E0B',
    pending: '#6B7280'
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SLA Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">On Time</p>
                <p className="text-2xl font-bold text-green-900">{slaMetrics?.onTime || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">SLA Breached</p>
                <p className="text-2xl font-bold text-red-900">{slaMetrics?.breached || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">At Risk</p>
                <p className="text-2xl font-bold text-yellow-900">{slaMetrics?.atRisk || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">SLA Compliance</p>
                <p className="text-2xl font-bold text-blue-900">{slaMetrics?.compliance || '0%'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Analysis Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">SLA Overview</TabsTrigger>
              <TabsTrigger value="trends">Breach Trends</TabsTrigger>
              <TabsTrigger value="performance">Performance by Type</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slaOverviewData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {slaOverviewData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SLA_COLORS[entry.name.toLowerCase().replace(' ', '') as keyof typeof SLA_COLORS] || '#6B7280'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} tickets`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="mt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={slaBreachTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="breached"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#EF4444' }}
                      activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: 'white' }}
                      name="SLA Breached"
                    />
                    <Line
                      type="monotone"
                      dataKey="onTime"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10B981' }}
                      activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: 'white' }}
                      name="On Time"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slaPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="type" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}%`, `${name} Rate`]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="complianceRate" 
                      name="SLA Compliance" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="breachRate" 
                      name="Breach Rate" 
                      fill="#EF4444" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SLAAnalysisSection;
