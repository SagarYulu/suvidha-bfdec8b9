
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AgentFeedbackStats } from '@/services/feedbackAnalyticsService';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
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
          <span className="text-blue-600 font-medium">Closed Tickets:</span> {payload[0].payload.closedTickets}
        </p>
        <p className="text-sm">
          <span className="text-green-600 font-medium">Feedback Received:</span> {payload[0].payload.receivedFeedback}
        </p>
        <p className="text-sm">
          <span className="text-purple-600 font-medium">Submission Rate:</span> {payload[0].payload.feedbackPercentage.toFixed(1)}%
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
  // Only show top 5 agents
  const topAgents = agentStats?.slice(0, 5) || [];
  
  if (totalClosedTickets === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
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
  
  // Prepare chart data for agents
  const chartData = topAgents.map((agent, index) => ({
    name: `Agent ${index + 1}`,
    feedbackPercentage: agent.feedbackPercentage,
    closedTickets: agent.closedTickets,
    receivedFeedback: agent.receivedFeedback,
  }));
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
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
        
        {/* Agent Feedback Charts */}
        {topAgents.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-medium mb-3">Top Agent Feedback Rates</h3>
            
            {/* Bar chart for agent comparison */}
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                    label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                    label={{ value: 'Rate (%)', angle: 90, position: 'insideRight' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" name="Closed Tickets" dataKey="closedTickets" fill="#8884d8" />
                  <Bar yAxisId="left" name="Feedback Received" dataKey="receivedFeedback" fill="#82ca9d" />
                  <Bar yAxisId="right" name="Submission Rate %" dataKey="feedbackPercentage" fill="#ff7300">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${140 + index * 40}, 80%, 60%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Simple list with percentage bars for quick scanning */}
            <div className="space-y-4 mt-8">
              <h4 className="text-sm font-medium text-gray-500">Agent Submission Rates</h4>
              {topAgents.map((agent, index) => (
                <div key={agent.agentId} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">Agent {index + 1}</span>
                      <span className="text-xs text-slate-500 ml-2">
                        ({agent.receivedFeedback}/{agent.closedTickets})
                      </span>
                    </div>
                    <span className="text-sm font-bold">{agent.feedbackPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={agent.feedbackPercentage} 
                    className="h-2 group-hover:h-3 transition-all" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
