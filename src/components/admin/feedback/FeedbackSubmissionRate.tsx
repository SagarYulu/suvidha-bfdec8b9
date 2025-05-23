
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AgentFeedbackStats } from '@/services/feedbackAnalyticsService';
import { BarChart3, AlertTriangle, ChartPie } from 'lucide-react';
import { 
  ComposedChart,
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts';

interface FeedbackSubmissionRateProps {
  totalFeedback: number;
  totalClosedTickets: number;
  submissionRate: number;
  agentStats?: AgentFeedbackStats[];
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-sm mt-1">
          <span className="text-blue-600 font-medium">Closed Tickets:</span> {payload[0]?.payload.closedTickets || 0}
        </p>
        <p className="text-sm">
          <span className="text-green-600 font-medium">Feedback Received:</span> {payload[1]?.payload.receivedFeedback || 0}
        </p>
        <p className="text-sm">
          <span className="text-purple-600 font-medium">Submission Rate:</span> {payload[2]?.value?.toFixed(1) || 0}%
        </p>
      </div>
    );
  }
  return null;
};

const FeedbackSubmissionRate: React.FC<FeedbackSubmissionRateProps> = ({
  totalFeedback,
  totalClosedTickets,
  submissionRate,
  agentStats
}) => {
  if (totalClosedTickets === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ChartPie className="mr-2 h-5 w-5" />
            Feedback Submission Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
            <p className="text-muted-foreground text-center">
              No closed tickets found in the selected period.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for the composed chart - simplified to just show the metrics without agent names
  // Generate index-based data points for better visualization
  const chartData = agentStats ? 
    agentStats.slice(0, 5).map((agent, index) => ({
      index: index + 1,
      closedTickets: agent.closedTickets,
      receivedFeedback: agent.receivedFeedback,
      feedbackRate: agent.feedbackPercentage
    })) : [];
  
  // Create a summary data point for overall metrics
  const overallData = {
    index: 0,
    closedTickets: totalClosedTickets,
    receivedFeedback: totalFeedback,
    feedbackRate: submissionRate
  };
  
  // Add the overall data point at the beginning
  const finalChartData = [overallData, ...chartData];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <ChartPie className="mr-2 h-5 w-5" />
          Feedback Submission Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Feedback Rate */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-slate-500 mb-1">Total Closed Tickets</h4>
              <p className="text-2xl font-bold">{totalClosedTickets}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-slate-500 mb-1">Feedback Received</h4>
              <p className="text-2xl font-bold">{totalFeedback}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-600 mb-1">Submission Rate</h4>
              <p className="text-2xl font-bold text-blue-700">{submissionRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between mb-1 text-sm">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <Progress value={submissionRate} className="h-3" />
          </div>
        </div>
        
        {/* Feedback Submission Rate Chart - New Composed Chart */}
        {finalChartData.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-medium mb-3">Feedback Submission Analysis</h3>
            <div className="h-80 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={finalChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="index" 
                    label={{ 
                      value: 'Index (0=Overall, 1-5=Top Agents by Submission Rate)', 
                      position: 'insideBottom', 
                      offset: -15 
                    }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Count', angle: -90, position: 'insideLeft' }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    domain={[0, 100]}
                    label={{ value: 'Rate (%)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="closedTickets" 
                    name="Closed Tickets" 
                    fill="#8884d8" 
                    barSize={40}
                  >
                    <LabelList dataKey="closedTickets" position="top" />
                  </Bar>
                  <Bar 
                    yAxisId="left" 
                    dataKey="receivedFeedback" 
                    name="Feedback Received" 
                    fill="#82ca9d"
                    barSize={40} 
                  >
                    <LabelList dataKey="receivedFeedback" position="top" />
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="feedbackRate"
                    name="Feedback Rate (%)"
                    stroke="#ff7300"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  >
                    <LabelList 
                      dataKey="feedbackRate" 
                      position="top" 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 text-xs text-slate-500 italic">
              <p>* The chart displays overall metrics (at index 0) followed by top 5 agents by feedback submission rate.</p>
              <p>* Agent identities are anonymized and indexed numerically for privacy.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
