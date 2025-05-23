
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AgentFeedbackStats } from '@/services/feedbackAnalyticsService';
import { ChartPie, AlertTriangle, BarChart3 } from 'lucide-react';

interface FeedbackSubmissionRateProps {
  totalFeedback: number;
  totalClosedTickets: number;
  submissionRate: number;
  agentStats?: AgentFeedbackStats[];
}

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
        
        {/* Agent Feedback Rates */}
        {topAgents.length > 0 && (
          <div>
            <h3 className="text-base font-medium mb-3">Top Agent Feedback Rates</h3>
            
            <div className="space-y-4">
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
