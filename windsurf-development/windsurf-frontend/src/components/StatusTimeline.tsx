
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Issue {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StatusTimelineProps {
  issues: Issue[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ issues }) => {
  // Process issues to create timeline data
  const processTimelineData = () => {
    const statusCounts: { [date: string]: { [status: string]: number } } = {};
    
    // Get last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });
    
    // Initialize counts
    last30Days.forEach(date => {
      statusCounts[date] = {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
      };
    });
    
    // Count issues by date and status
    issues.forEach(issue => {
      const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
      if (statusCounts[issueDate]) {
        statusCounts[issueDate][issue.status] = (statusCounts[issueDate][issue.status] || 0) + 1;
      }
    });
    
    // Convert to chart format
    return last30Days.map(date => ({
      date,
      dateLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: statusCounts[date].open,
      in_progress: statusCounts[date].in_progress,
      resolved: statusCounts[date].resolved,
      closed: statusCounts[date].closed
    }));
  };

  const timelineData = processTimelineData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item: any) => (
            <p key={item.dataKey} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.value}
            </p>
          ))}
          <p className="text-sm font-medium mt-1 pt-1 border-t">
            Total: {total}
          </p>
        </div>
      );
    }
    return null;
  };

  if (issues.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No timeline data</p>
          <p className="text-sm">Issue timeline will appear when issues are created</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={timelineData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="dateLabel" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="open" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="Open"
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="in_progress" 
            stroke="#F59E0B" 
            strokeWidth={2}
            name="In Progress"
            dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Resolved"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="closed" 
            stroke="#6B7280" 
            strokeWidth={2}
            name="Closed"
            dot={{ fill: '#6B7280', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-6">
        {[
          { name: 'Open', color: '#EF4444' },
          { name: 'In Progress', color: '#F59E0B' },
          { name: 'Resolved', color: '#10B981' },
          { name: 'Closed', color: '#6B7280' }
        ].map(({ name, color }) => (
          <div key={name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm text-gray-600">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
