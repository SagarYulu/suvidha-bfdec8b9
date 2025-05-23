
import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

// Define interfaces for our data structure
export interface SubReasonItem {
  id: string;
  name: string;
  value: number;
  sentiment: string;
  percentage: number;
  sentimentIndex: number;
}

export interface SentimentGroup {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  subReasons: SubReasonItem[];
}

interface FeedbackHierarchyChartProps {
  data: SentimentGroup[];
  totalCount: number;
}

// Color palettes for each sentiment
const colorMap = {
  happy: ['#4ade80', '#22c55e', '#16a34a'],  // Green shades
  neutral: ['#fde047', '#facc15', '#eab308'], // Yellow shades
  sad: ['#f87171', '#ef4444', '#dc2626']      // Red shades
};

const FeedbackHierarchyChart: React.FC<FeedbackHierarchyChartProps> = ({ data, totalCount }) => {
  const [activeIndex, setActiveIndex] = useState<{ outer: number | null, inner: number | null }>({
    outer: null,
    inner: null
  });
  
  // Function to handle mouse hover on outer pie (sentiments)
  const onOuterPieEnter = (_: any, index: number) => {
    setActiveIndex({ outer: index, inner: null });
  };
  
  // Function to handle mouse hover on inner pie (sub-reasons)
  const onInnerPieEnter = (_: any, index: number) => {
    setActiveIndex({ ...activeIndex, inner: index });
  };
  
  // Function to handle mouse leave
  const onPieLeave = () => {
    setActiveIndex({ outer: null, inner: null });
  };

  // Prepare data for sub-reasons pie chart (flattened)
  const prepareSubReasonData = () => {
    const result: Array<SubReasonItem & { sentimentColor: string, fill: string }> = [];
    
    data.forEach((sentiment, sentimentIndex) => {
      const colorPalette = colorMap[sentiment.name.toLowerCase() as keyof typeof colorMap] || ['#cbd5e1', '#94a3b8', '#64748b'];
      
      sentiment.subReasons.forEach((subReason, subIndex) => {
        result.push({
          ...subReason,
          sentimentColor: sentiment.color,
          fill: colorPalette[subIndex % colorPalette.length]
        });
      });
    });
    
    return result;
  };

  // Custom shape for active sentiment segments
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload
    } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  // Custom shape for active sub-reason segments
  const renderActiveSubReasonShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill
    } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 3}
          outerRadius={outerRadius + 3}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
      </g>
    );
  };

  // Custom tooltip for both pies
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
          {data.sentiment && (
            <div className="font-medium mb-1 pb-1 border-b">
              {data.sentiment}: {data.name}
            </div>
          )}
          {!data.sentiment && (
            <div className="font-medium mb-1 pb-1 border-b">
              {data.name}
            </div>
          )}
          <div className="space-y-1">
            <div><span className="font-semibold">Count:</span> {data.value}</div>
            <div>
              <span className="font-semibold">Percentage:</span> {data.percentage.toFixed(1)}% 
              {data.sentiment ? ' of total' : ' within category'}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Render text-based breakdown of sentiment and sub-reasons
  const renderTextualBreakdown = () => {
    return (
      <div className="mt-8 space-y-6">
        {data.map((sentiment) => (
          <div key={sentiment.id} className="space-y-2">
            <h3 className="text-lg font-semibold" style={{ color: sentiment.color }}>
              {sentiment.name} ({sentiment.value} | {sentiment.percentage.toFixed(1)}%)
            </h3>
            <div className="pl-5 space-y-1">
              {sentiment.subReasons.map((reason) => (
                <p key={reason.id} className="text-sm">
                  &gt; {reason.name} ({reason.value} | {reason.percentage.toFixed(1)}%)
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Check if we have data to display
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment & Reason Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-500">No feedback data available to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare sub-reasons data
  const subReasonsData = prepareSubReasonData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment & Reason Breakdown</CardTitle>
        <CardDescription>
          Total responses: {totalCount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Outer pie chart for sentiment categories */}
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={65}
                dataKey="value"
                onMouseEnter={onOuterPieEnter}
                onMouseLeave={onPieLeave}
                activeIndex={activeIndex.outer}
                activeShape={renderActiveShape}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`sentiment-${index}`} 
                    fill={entry.color} 
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              
              {/* Inner pie chart for sub-reasons */}
              <Pie
                data={subReasonsData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                dataKey="value"
                paddingAngle={0.5}
                onMouseEnter={onInnerPieEnter}
                onMouseLeave={onPieLeave}
                activeIndex={activeIndex.inner}
                activeShape={renderActiveSubReasonShape}
              >
                {subReasonsData.map((entry, index) => (
                  <Cell 
                    key={`subreason-${index}`} 
                    fill={entry.fill}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              
              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Text-based breakdown showing the format requested by the user */}
        {renderTextualBreakdown()}
      </CardContent>
    </Card>
  );
};

export default FeedbackHierarchyChart;
