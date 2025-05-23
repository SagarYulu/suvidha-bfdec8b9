
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AgentFeedbackStats } from '@/services/feedbackAnalyticsService';
import { Clock } from 'lucide-react';
import { 
  ComposedChart,
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label
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
        <p className="font-medium">{`Agent ${label}`}</p>
        <p className="text-sm mt-1">
          <span className="text-purple-600 font-medium">Closed Tickets:</span> {payload[0]?.value}
        </p>
        <p className="text-sm">
          <span className="text-green-600 font-medium">Feedback Received:</span> {payload[1]?.value}
        </p>
        <p className="text-sm">
          <span className="text-orange-500 font-medium">Submission Rate:</span> {payload[2]?.value?.toFixed(1)}%
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
  // Generate data for the chart - use index instead of agent names
  const chartData = agentStats 
    ? [
        // Overall metrics at index 0
        {
          index: 0,
          closedTickets: totalClosedTickets,
          receivedFeedback: totalFeedback,
          feedbackRate: submissionRate
        },
        // Top 5 agents data anonymized by index
        ...agentStats.slice(0, 5).map((agent, idx) => ({
          index: idx + 1,
          closedTickets: agent.closedTickets,
          receivedFeedback: agent.receivedFeedback,
          feedbackRate: agent.feedbackPercentage
        }))
      ]
    : [
        // If no agent stats, just show overall metrics
        {
          index: 0,
          closedTickets: totalClosedTickets,
          receivedFeedback: totalFeedback,
          feedbackRate: submissionRate
        }
      ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Feedback Submission Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Metrics Display */}
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
        
        {/* Progress Bar */}
        <div className="mt-2 mb-6">
          <div className="flex justify-between mb-1 text-xs text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <Progress value={submissionRate} className="h-2" 
            style={{
              background: '#e5e7eb',
              borderRadius: '9999px',
            }}
          />
        </div>
        
        {/* Chart Section */}
        <div className="mt-8">
          <h3 className="text-base font-medium mb-3">Feedback Submission Analysis</h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="index"
                  tickFormatter={(value) => value === 0 ? 'Overall' : `${value}`}
                >
                  <Label value="Index (0=Overall, 1-5=Top Agents by Submission Rate)" position="bottom" offset={0} />
                </XAxis>
                
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                />
                
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 'dataMax + 50']}
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
                />
                
                <Bar 
                  yAxisId="left" 
                  dataKey="receivedFeedback" 
                  name="Feedback Received" 
                  fill="#82ca9d" 
                  barSize={40} 
                />
                
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="feedbackRate"
                  name="Submission Rate (%)"
                  stroke="#ff7300"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  label={{
                    position: 'top',
                    formatter: (value: number) => `${value.toFixed(1)}%`,
                    style: { fontSize: 12 }
                  }}
                />
                
                <ReferenceLine
                  yAxisId="right"
                  y={50}
                  stroke="#666"
                  strokeDasharray="3 3"
                  label={{
                    value: "50%",
                    position: "right"
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Notes */}
          <div className="mt-4 text-xs text-slate-500">
            <p>* The chart displays overall metrics (at index 0) followed by top 5 agents by feedback submission rate.</p>
            <p>* Agent identities are anonymized and indexed numerically for privacy.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
