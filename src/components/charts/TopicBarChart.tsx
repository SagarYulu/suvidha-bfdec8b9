
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

interface TopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
    resolutionTime?: number;
  }>;
  showComparison?: boolean;
  isResolutionTime?: boolean;
}

const TopicBarChart: React.FC<TopicBarChartProps> = ({ 
  data, 
  showComparison = false,
  isResolutionTime = false
}) => {
  // Format resolution time for display (ensure it's in working hours)
  const formatResolutionTime = (hours: number) => {
    if (hours < 8) {
      return `${hours.toFixed(1)} hrs`;
    } else {
      const days = Math.floor(hours / 8); // Convert to working days (8 hours per day)
      const remainingHours = hours % 8;
      return remainingHours > 0 ? 
        `${days}d ${remainingHours.toFixed(1)}h` : 
        `${days}d`;
    }
  };

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      // Calculate change percentage for better insight
      let changePercent = 0;
      if (showComparison && item.previousCount && item.previousCount > 0) {
        changePercent = ((item.count - item.previousCount) / item.previousCount) * 100;
      }
      
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="mt-2 space-y-1">
            {isResolutionTime ? (
              <p className="text-sm">
                Current Resolution Time: <span className="font-medium">{formatResolutionTime(item.count)}</span>
                <span className="text-xs ml-1 text-gray-500">(working hours)</span>
              </p>
            ) : (
              <p className="text-sm">
                Current: <span className="font-medium">{item.count}</span> mentions
              </p>
            )}
            
            {showComparison && item.previousCount !== undefined && (
              <p className="text-sm">
                Previous: <span className="font-medium">
                  {isResolutionTime 
                    ? formatResolutionTime(item.previousCount) 
                    : item.previousCount}
                </span>
                {!isResolutionTime && " mentions"}
              </p>
            )}
            
            {showComparison && item.previousCount !== undefined && (
              <div className="pt-1 border-t border-gray-100">
                <p className="text-sm">
                  Change: {" "}
                  <span className={
                    item.count > item.previousCount 
                      ? isResolutionTime ? "text-red-600 font-medium" : "text-green-600 font-medium" 
                      : item.count < item.previousCount 
                        ? isResolutionTime ? "text-green-600 font-medium" : "text-red-600 font-medium" 
                        : "text-gray-600"
                  }>
                    {item.count > item.previousCount ? '+' : ''}
                    {isResolutionTime 
                      ? formatResolutionTime(Math.abs(item.count - item.previousCount))
                      : `${item.count - item.previousCount} mentions`}
                  </span>
                </p>
                
                {item.previousCount > 0 && (
                  <p className="text-sm">
                    <span className={
                      isResolutionTime
                        ? (changePercent > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium")
                        : (changePercent > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium")
                    }>
                      {changePercent > 0 ? '+' : ''}
                      {changePercent.toFixed(1)}%
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle long label wrapping
  const wrapLabel = (label: string) => {
    if (!label) return '';
    
    const maxLength = 15;
    if (label.length <= maxLength) return label;
    
    // Find space near the middle to break at
    const midPoint = Math.floor(label.length / 2);
    let breakPoint = label.indexOf(' ', midPoint - 5);
    
    if (breakPoint === -1) {
      breakPoint = midPoint;
    }
    
    return `${label.substring(0, breakPoint)}\n${label.substring(breakPoint + 1)}`;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
            tickFormatter={wrapLabel}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ 
              value: isResolutionTime ? 'Resolution Time (working hours)' : 'Number of Mentions', 
              position: 'insideLeft', 
              angle: -90, 
              dy: 50, 
              dx: -10, 
              style: { textAnchor: 'middle' } 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => {
              if (value === "count") return isResolutionTime ? "Resolution Time" : "Current Period";
              if (value === "previousCount") return isResolutionTime ? "Previous Period" : "Previous Period";
              return value;
            }}
          />
          
          {/* Previous period bars (if comparison enabled) */}
          {showComparison && (
            <Bar 
              dataKey="previousCount"
              name="previousCount"
              radius={[0, 0, 0, 0]}
              fill="#9CA3AF"
              fillOpacity={0.6}
              barSize={20}
            />
          )}
          
          {/* Current period bars */}
          <Bar 
            dataKey="count"
            name="count"
            radius={[4, 4, 0, 0]}
            barSize={20}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(${210 - index * (150 / Math.max(data.length, 1))}, 80%, 55%)`} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
