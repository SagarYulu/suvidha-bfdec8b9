
import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector 
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
        <text 
          x={cx} 
          y={cy - 15} 
          textAnchor="middle" 
          fill="#333"
          fontSize={14}
          fontWeight="bold"
        >
          {payload.name}
        </text>
        <text 
          x={cx} 
          y={cy + 8} 
          textAnchor="middle" 
          fill="#666"
          fontSize={12}
        >
          {payload.value} responses
        </text>
        <text 
          x={cx} 
          y={cy + 24} 
          textAnchor="middle" 
          fill="#666"
          fontSize={12}
        >
          {payload.percentage.toFixed(1)}% of total
        </text>
      </g>
    );
  };

  // Custom shape for active sub-reason segments
  const renderActiveSubReasonShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload
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

  // Generate labels for sentiment categories and sub-reasons
  const renderLabels = () => {
    const chartWidth = 440; // Approximate chart width
    const chartHeight = 340; // Approximate chart height
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const labelItems = [];
    
    // Render sentiment category labels
    data.forEach((sentiment, sentimentIndex) => {
      const angle = (sentimentIndex * 2 * Math.PI) / data.length;
      const x = centerX + Math.sin(angle) * 25; // Adjust position for sentiment labels
      const y = centerY - Math.cos(angle) * 25;
      
      // Add sentiment label with percentage
      labelItems.push(
        <div 
          key={`sentiment-label-${sentimentIndex}`}
          className="absolute flex items-center gap-1.5" 
          style={{ 
            left: x + 'px',
            top: y + 'px',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="flex items-center">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: sentiment.color }}
            />
            <span className="font-medium">
              {sentiment.name} ({sentiment.percentage.toFixed(1)}%)
            </span>
          </span>
        </div>
      );
    });
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {labelItems}
      </div>
    );
  };

  // Custom legend that shows count and percentage
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    
    // Group legend items by sentiment
    const legendByCategory: Record<string, any[]> = {};
    
    payload.forEach((entry: any) => {
      const sentimentName = entry.payload.sentiment || entry.value;
      if (!legendByCategory[sentimentName]) {
        legendByCategory[sentimentName] = [];
      }
      legendByCategory[sentimentName].push(entry);
    });
    
    return (
      <div className="pt-6">
        {Object.entries(legendByCategory).map(([sentiment, entries], catIndex) => {
          const mainEntry = entries.find(entry => !entry.payload.sentiment) || entries[0];
          const sentimentColor = mainEntry?.color || '#888';
          
          return (
            <div key={`legend-category-${catIndex}`} className="mb-2">
              {/* Main sentiment category */}
              <div className="flex items-center gap-2 mb-1.5">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: sentimentColor }}
                />
                <span className="text-sm font-medium">
                  {sentiment} ({mainEntry?.payload?.percentage?.toFixed(1)}%)
                </span>
              </div>
              
              {/* Sub-reasons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 pl-5">
                {entries.filter(entry => entry.payload.sentiment).map((entry, index) => (
                  <div 
                    key={`legend-item-${catIndex}-${index}`}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate max-w-[180px]" title={entry.value}>
                      {entry.value}
                    </span>
                    <span className="text-gray-500 whitespace-nowrap">
                      ({entry.payload.value} | {entry.payload.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
        <div className="h-96 md:h-[440px] w-full">
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
                labelLine={false}
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
              
              {/* Tooltips and Legend */}
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                content={renderCustomLegend}
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackHierarchyChart;
