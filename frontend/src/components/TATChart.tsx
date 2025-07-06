
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface TATData {
  period: string;
  averageTAT: number;
  targetTAT: number;
  totalIssues: number;
  withinSLA: number;
  breachedSLA: number;
}

interface TATChartProps {
  data: TATData[];
  title?: string;
  targetSLA?: number;
}

const TATChart: React.FC<TATChartProps> = ({
  data,
  title = "Turnaround Time Analysis",
  targetSLA = 24
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Average TAT: {data.averageTAT.toFixed(1)} hours
            </p>
            <p className="text-orange-600">
              Target: {data.targetTAT} hours
            </p>
            <p className="text-gray-600">
              Total Issues: {data.totalIssues}
            </p>
            <p className="text-green-600">
              Within SLA: {data.withinSLA} ({((data.withinSLA / data.totalIssues) * 100).toFixed(1)}%)
            </p>
            <p className="text-red-600">
              Breached SLA: {data.breachedSLA} ({((data.breachedSLA / data.totalIssues) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getOverallSLACompliance = () => {
    const totalIssues = data.reduce((sum, item) => sum + item.totalIssues, 0);
    const totalWithinSLA = data.reduce((sum, item) => sum + item.withinSLA, 0);
    return totalIssues > 0 ? (totalWithinSLA / totalIssues) * 100 : 0;
  };

  const getAverageTAT = () => {
    if (data.length === 0) return 0;
    const totalTAT = data.reduce((sum, item) => sum + item.averageTAT, 0);
    return totalTAT / data.length;
  };

  const getTrend = () => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3);
    const earlier = data.slice(-6, -3);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, item) => sum + item.averageTAT, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item.averageTAT, 0) / earlier.length;
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const slaCompliance = getOverallSLACompliance();
  const averageTAT = getAverageTAT();
  const trend = getTrend();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant={slaCompliance >= 90 ? "default" : slaCompliance >= 75 ? "secondary" : "destructive"}
            >
              {slaCompliance.toFixed(1)}% SLA Compliance
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {trend === 'increasing' && <TrendingUp className="h-3 w-3 text-red-500" />}
              {trend === 'decreasing' && <TrendingDown className="h-3 w-3 text-green-500" />}
              {averageTAT.toFixed(1)}h Avg TAT
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Average TAT bars */}
              <Bar 
                dataKey="averageTAT" 
                fill="#3b82f6"
                name="Average TAT"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Target line */}
              <Line
                type="monotone"
                dataKey="targetTAT"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target TAT"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {averageTAT.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Average TAT</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {slaCompliance.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">SLA Compliance</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {targetSLA}h
            </div>
            <div className="text-sm text-gray-600">Target SLA</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {data.reduce((sum, item) => sum + item.totalIssues, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TATChart;
